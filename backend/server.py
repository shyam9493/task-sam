from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse
import json
import uuid
from dotenv import load_dotenv
import os

from models import ChatRequest, ChatResponse
from gemini_client import gemini_client
from pdf_processor import pdf_processor
from queue_manager import job_queue

# Load environment variables
load_dotenv()

app = FastAPI(title="AI Search Chat API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {
        "message": "AI Search Chat API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "POST /api/chat",
            "stream": "GET /api/stream/{job_id}",
            "pdf": "GET /api/pdf/{document_id}"
        }
    }

@app.post("/api/chat", response_model=ChatResponse)
async def create_chat(request: ChatRequest):
    """
    Create a new chat request and return job ID for streaming
    """
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversationId or str(uuid.uuid4())
        
        # Create job
        job_id = job_queue.create_job(request.query, conversation_id)
        
        return ChatResponse(
            jobId=job_id,
            conversationId=conversation_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stream/{job_id}")
async def stream_response(job_id: str):
    """
    Server-Sent Events endpoint for streaming AI responses
    """
    # Get job
    job = job_queue.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Update job status
    job_queue.update_job_status(job_id, "streaming")
    
    async def event_generator():
        try:
            # Get available PDFs
            available_docs = pdf_processor.list_available_pdfs()
            
            if not available_docs:
                # Send error if no PDFs available
                yield {
                    "event": "error",
                    "data": json.dumps({
                        "error": "no_documents",
                        "message": "No PDF documents available. Please add PDFs to the sample_pdfs directory."
                    })
                }
                return
            
            # Stream response from Gemini
            async for event in gemini_client.generate_response_stream(
                job["query"],
                available_docs
            ):
                # Convert event to SSE format
                yield {
                    "event": "message",
                    "data": json.dumps(event)
                }
            
            # Update job status
            job_queue.update_job_status(job_id, "completed")
            
        except Exception as e:
            print(f"Streaming error: {e}")
            yield {
                "event": "error",
                "data": json.dumps({
                    "error": "stream_failed",
                    "message": str(e)
                })
            }
            job_queue.update_job_status(job_id, "failed")
    
    return EventSourceResponse(event_generator())

@app.get("/api/pdf/{document_id}")
async def get_pdf(document_id: str):
    """
    Serve PDF file
    """
    try:
        pdf_path = pdf_processor.get_pdf_path(document_id)
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=404, detail="PDF not found")
        
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"{document_id}.pdf"
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="PDF not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def list_documents():
    """
    List all available PDF documents
    """
    try:
        documents = pdf_processor.list_available_pdfs()
        return {
            "documents": [
                {
                    "id": doc_id,
                    "title": doc_id.replace("_", " ").title()
                }
                for doc_id in documents
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        reload=True
    )

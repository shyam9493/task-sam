import os
from openai import OpenAI
from typing import AsyncGenerator, Dict, List
import json
from models import Citation, SourceCard, ToolCall
from pdf_processor import pdf_processor

class GroqClient:
    def __init__(self):
        # Groq uses OpenAI-compatible API
        api_key = os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY") or os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("GROK_API_KEY, XAI_API_KEY, or GROQ_API_KEY environment variable not set")
        
        # Initialize OpenAI client with Groq's base URL
        self.client = OpenAI(
            api_key=api_key,
            base_url="https://api.groq.com/openai/v1"
        )
        # Use Groq's fast models
        self.model = "llama-3.3-70b-versatile"  # Fast and capable model
        
    async def generate_response_stream(
        self,
        query: str,
        available_documents: List[str]
    ) -> AsyncGenerator[Dict, None]:
        """
        Generate streaming response with citations from Grok API
        """
        
        # Step 1: Emit tool call for searching documents
        yield {
            "event": "tool_call",
            "data": {
                "toolCall": {
                    "id": "tc-1",
                    "name": "search_documents",
                    "status": "running",
                    "description": "Searching available documents..."
                }
            }
        }
        
        # Load PDF content for context
        pdf_contexts = []
        for doc_id in available_documents:
            try:
                text = pdf_processor.get_all_text(doc_id)
                # Limit text to avoid token limits (take first 10000 chars per doc)
                pdf_contexts.append({
                    "document_id": doc_id,
                    "title": doc_id.replace("_", " ").title(),
                    "content": text[:10000]
                })
            except Exception as e:
                print(f"Error loading {doc_id}: {e}")
        
        # Complete search tool call
        yield {
            "event": "tool_call",
            "data": {
                "toolCall": {
                    "id": "tc-1",
                    "name": "search_documents",
                    "status": "completed",
                    "description": f"Found {len(pdf_contexts)} documents"
                }
            }
        }
        
        # Step 2: Emit tool call for analyzing content
        yield {
            "event": "tool_call",
            "data": {
                "toolCall": {
                    "id": "tc-2",
                    "name": "analyze_content",
                    "status": "running",
                    "description": "Analyzing document content..."
                }
            }
        }
        
        # Build prompt with PDF context
        context_text = "\n\n".join([
            f"Document: {ctx['title']}\nContent:\n{ctx['content']}"
            for ctx in pdf_contexts
        ])
        
        system_prompt = """You are an AI assistant that answers questions based on provided documents. 
When you reference information from a document, include an inline citation like [1], [2], etc.

Instructions:
1. Answer the question using information from the documents
2. Include inline citations [1], [2] when referencing specific information
3. Be concise and accurate
4. If the documents don't contain relevant information, say so"""

        user_prompt = f"""Available Documents:
{context_text}

User Question: {query}

Answer:"""
        
        # Complete analyze tool call
        yield {
            "event": "tool_call",
            "data": {
                "toolCall": {
                    "id": "tc-2",
                    "name": "analyze_content",
                    "status": "completed",
                    "description": "Analysis complete"
                }
            }
        }
        
        # Step 3: Stream the response
        try:
            print(f"[DEBUG] Calling Grok API with model: {self.model}")
            print(f"[DEBUG] Query: {query}")
            
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=1024,
            )
            
            full_text = ""
            citation_counter = 1
            citations_added = set()
            chunk_count = 0
            
            for chunk in stream:
                chunk_count += 1
                if chunk.choices[0].delta.content:
                    delta = chunk.choices[0].delta.content
                    full_text += delta
                    
                    # Yield text delta
                    yield {
                        "event": "text",
                        "data": {
                            "delta": delta
                        }
                    }
                    
                    # Check for citation markers in accumulated text
                    # Simple heuristic: look for [1], [2], etc.
                    import re
                    citation_matches = re.findall(r'\[(\d+)\]', full_text)
                    
                    for match in citation_matches:
                        citation_num = int(match)
                        if citation_num not in citations_added and citation_num <= len(pdf_contexts):
                            citations_added.add(citation_num)
                            
                            # Create citation from context
                            ctx = pdf_contexts[citation_num - 1]
                            
                            # Extract a relevant excerpt (simplified - just take first 200 chars)
                            excerpt = ctx['content'][:200].strip() + "..."
                            
                            yield {
                                "event": "citation",
                                "data": {
                                    "citation": {
                                        "id": citation_num,
                                        "documentId": ctx['document_id'],
                                        "documentTitle": ctx['title'],
                                        "pageNumber": 1,  # Simplified - always page 1
                                        "text": excerpt
                                    }
                                }
                            }
            
            print(f"[DEBUG] Received {chunk_count} chunks from Grok API")
            print(f"[DEBUG] Total text length: {len(full_text)}")
            
            # Step 4: Emit source cards for cited documents
            for citation_num in sorted(citations_added):
                ctx = pdf_contexts[citation_num - 1]
                excerpt = ctx['content'][:200].strip() + "..."
                
                yield {
                    "event": "source",
                    "data": {
                        "source": {
                            "documentId": ctx['document_id'],
                            "title": ctx['title'],
                            "pageNumber": 1,
                            "excerpt": excerpt
                        }
                    }
                }
            
            # Step 5: Emit done event
            yield {
                "event": "done",
                "data": {}
            }
            
        except Exception as e:
            print(f"[ERROR] Grok API error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            yield {
                "event": "error",
                "data": {
                    "error": "generation_failed",
                    "message": str(e)
                }
            }

# Global instance
groq_client = GroqClient()

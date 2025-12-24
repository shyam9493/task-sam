import os
import google.generativeai as genai
from typing import AsyncGenerator, Dict, List
import json
from models import Citation, SourceCard, ToolCall
from pdf_processor import pdf_processor

class GeminiClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def generate_response_stream(
        self,
        query: str,
        available_documents: List[str]
    ) -> AsyncGenerator[Dict, None]:
        """
        Generate streaming response with citations from Gemini API
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
        
        prompt = f"""You are an AI assistant that answers questions based on provided documents. 
When you reference information from a document, include an inline citation like [1], [2], etc.

Available Documents:
{context_text}

User Question: {query}

Instructions:
1. Answer the question using information from the documents
2. Include inline citations [1], [2] when referencing specific information
3. Be concise and accurate
4. If the documents don't contain relevant information, say so

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
            response = self.model.generate_content(
                prompt,
                stream=True,
                generation_config=genai.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1024,
                )
            )
            
            full_text = ""
            citation_counter = 1
            citations_added = set()
            
            for chunk in response:
                if chunk.text:
                    full_text += chunk.text
                    
                    # Yield text delta
                    yield {
                        "event": "text",
                        "data": {
                            "delta": chunk.text
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
            yield {
                "event": "error",
                "data": {
                    "error": "generation_failed",
                    "message": str(e)
                }
            }

# Global instance
gemini_client = GeminiClient()

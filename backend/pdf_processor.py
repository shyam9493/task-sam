import pdfplumber
from typing import Dict, List, Tuple
import os

class PDFProcessor:
    def __init__(self, pdf_directory: str = "sample_pdfs"):
        self.pdf_directory = pdf_directory
        self.pdf_cache: Dict[str, Dict] = {}
        
    def load_pdf(self, document_id: str) -> Dict:
        """Load and cache PDF content"""
        if document_id in self.pdf_cache:
            return self.pdf_cache[document_id]
        
        pdf_path = os.path.join(self.pdf_directory, f"{document_id}.pdf")
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF not found: {document_id}")
        
        pages_text = []
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                pages_text.append({
                    "page_number": page_num,
                    "text": text,
                    "char_count": len(text)
                })
        
        pdf_data = {
            "document_id": document_id,
            "num_pages": len(pages_text),
            "pages": pages_text
        }
        
        self.pdf_cache[document_id] = pdf_data
        return pdf_data
    
    def get_all_text(self, document_id: str) -> str:
        """Get all text from PDF concatenated"""
        pdf_data = self.load_pdf(document_id)
        return "\n\n".join([page["text"] for page in pdf_data["pages"]])
    
    def search_text(self, document_id: str, search_text: str) -> List[Tuple[int, str]]:
        """Search for text in PDF and return (page_number, excerpt) tuples"""
        pdf_data = self.load_pdf(document_id)
        results = []
        
        search_lower = search_text.lower()
        for page in pdf_data["pages"]:
            page_text = page["text"]
            if search_lower in page_text.lower():
                # Find the excerpt around the search text
                idx = page_text.lower().find(search_lower)
                start = max(0, idx - 100)
                end = min(len(page_text), idx + len(search_text) + 100)
                excerpt = page_text[start:end].strip()
                results.append((page["page_number"], excerpt))
        
        return results
    
    def get_page_text(self, document_id: str, page_number: int) -> str:
        """Get text from specific page"""
        pdf_data = self.load_pdf(document_id)
        for page in pdf_data["pages"]:
            if page["page_number"] == page_number:
                return page["text"]
        return ""
    
    def get_pdf_path(self, document_id: str) -> str:
        """Get full path to PDF file"""
        return os.path.join(self.pdf_directory, f"{document_id}.pdf")
    
    def list_available_pdfs(self) -> List[str]:
        """List all available PDF document IDs"""
        if not os.path.exists(self.pdf_directory):
            return []
        
        pdfs = []
        for filename in os.listdir(self.pdf_directory):
            if filename.endswith('.pdf'):
                pdfs.append(filename[:-4])  # Remove .pdf extension
        return pdfs

# Global instance
pdf_processor = PDFProcessor()

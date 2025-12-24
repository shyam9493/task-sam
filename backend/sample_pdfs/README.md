# Sample PDFs Directory

This directory should contain your PDF documents for the AI to search through.

## How to Add PDFs

1. Place your PDF files in this directory
2. Name them descriptively (e.g., `machine_learning.pdf`, `python_guide.pdf`)
3. The system will automatically detect and use all PDFs

## Sample PDF Content

For testing, you can use any PDF documents. Here are some suggestions:

- Research papers
- Technical documentation
- Books or ebooks
- Product manuals
- Reports

## Note

PDF files are gitignored for security and size reasons. Each user should add their own PDFs locally.

## Creating a Test PDF

You can create a simple test PDF using:

**Option 1: Online Tools**
- Use any "Markdown to PDF" converter
- Convert text documents to PDF

**Option 2: macOS**
- Open any document in Preview
- File → Export as PDF

**Option 3: Python**
```python
from reportlab.pdfgen import canvas

c = canvas.Canvas("sample.pdf")
c.drawString(100, 750, "Sample PDF for Testing")
c.drawString(100, 730, "This is a test document about machine learning.")
c.save()
```

Once you have PDFs in this directory, restart the backend server and they will be available for querying.

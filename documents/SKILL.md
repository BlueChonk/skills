---
name: documents
description: "Create, edit, redline, and comment on .docx / Word documents with a strict render-and-verify workflow. Use when the user needs to create new documents, edit existing ones, add tracked changes or comments, perform accessibility audits, or merge multiple DOCX files. Covers the full document lifecycle: read, create, edit, verify, redline, comment, protect."
---

# Documents Skill (DSH)

Create and modify `.docx` / Word documents using Python (`python-docx`) and PowerShell, with a strict render-and-verify workflow.

## Tools + Contract

- Use `pwsh` to run Python scripts for DOCX creation, editing, and QA.
- Use `read_image` to visually inspect rendered pages.
- Use `read` to inspect document structure (unzip .docx → inspect XML).
- Run all scripts from a writable workspace directory.

## Quick Start

```powershell
# Install python-docx if needed
pip install python-docx

# Create a simple document
python -c "
from docx import Document
doc = Document()
doc.add_heading('Title', level=1)
doc.add_paragraph('Content here.')
doc.save('D:\Projects\output.docx')
"
```

## Render to PNG for Visual QA

Convert DOCX to PNG screenshots using LibreOffice headless:

```powershell
# Requires LibreOffice installed
& "C:\Program Files\LibreOffice\program\soffice.exe" --headless --convert-to pdf --outdir D:\Projects D:\Projects\output.docx
# Then convert PDF to PNG (using ImageMagick or similar)
& magick -density 200 "D:\Projects\output.pdf" "D:\Projects\output-page.png"
```

Then read in DSH: `read_image("D:\Projects\output-page.png")`

**Alternative without LibreOffice:** Write a Python script using `python-docx` + `Pillow` to render pages manually.

## Core Workflow (80/20)

1. **Clarify** — Ask about topic, audience, and purpose for new documents.
2. **Author/edit** with `python-docx` (paragraphs, runs, styles, tables, headers/footers).
3. **Render → inspect PNGs immediately** as your feedback loop.
4. **Fix and repeat** until PNGs are visually perfect.
5. **OOXML patching** (only when needed) for tracked changes, comments, hyperlinks, fields.
6. **Re-render** after any OOXML patch or layout-sensitive change.
7. **Deliver** only after the latest PNG review passes (all pages, 100% zoom).

## Common Operations

### Create new document
```python
from docx import Document
from docx.shared import Inches, Pt, RGBColor

doc = Document()
doc.add_heading('Document Title', level=1)
p = doc.add_paragraph()
run = p.add_run('Bold text')
run.bold = True
run.font.size = Pt(14)
doc.save('output.docx')
```

### Edit existing document
```python
from docx import Document
doc = Document('existing.docx')
for para in doc.paragraphs:
    if 'old text' in para.text:
        para.text = para.text.replace('old text', 'new text')
doc.save('modified.docx')
```

### Add tracked changes (redlines)
Use `python-docx` with custom XML manipulation or the `docx-redlining` package:

```powershell
pip install docx-redlining
```

### Add comments
```python
from docx import Document
from docx.oxml.ns import qn
from lxml import etree

doc = Document('input.docx')
paragraph = doc.paragraphs[0]
# Add comment via XML manipulation
comments_part = doc.part.comments_part
# ... (full comment XML construction)
```

### Accessibility audit
```python
from docx import Document
doc = Document('input.docx')
for table in doc.tables:
    # Check for header rows, alt text, etc.
    print(f"Table: {len(table.rows)} rows, {len(table.columns)} cols")
for rel in doc.part.rels.values():
    if "image" in rel.target_ref:
        # Check for alt text
        pass
```

### Merge documents
```python
from docx import Document
from docxcompose.composer import Composer

master = Document('master.docx')
composer = Composer(master)
doc2 = Document('appendix.docx')
composer.append(doc2)
composer.save('merged.docx')
```

### Protect / restrict editing
```python
from docx import Document
from docx.oxml.ns import qn
doc = Document('input.docx')
# Add document protection XML element
settings = doc.settings
# ... (protection element construction)
doc.save('protected.docx')
```

## Quality Checklist

- [ ] No clipped or overlapping text
- [ ] Tables have proper padding (not boundary-hugging)
- [ ] Headers/footers correctly positioned
- [ ] Font choices are professional and readable (not too small)
- [ ] Color is intentional, not decorative
- [ ] Document density is manageable (avoid walls of text)
- [ ] Tables have deliberate column widths (not equal-width by default)
- [ ] Spacing is natural and generous between sections
- [ ] Tracked changes render correctly
- [ ] Comments are visible and properly anchored

## Scripts Directory

Place reusable helper scripts in `scripts/`:

- `scripts/create_docx.py` — Template-based document creation
- `scripts/render_docx.py` — DOCX → PNG renderer
- `scripts/style_lint.py` — Format consistency checker
- `scripts/merge_docx.py` — Multi-document merge
- `scripts/a11y_audit.py` — Accessibility checker

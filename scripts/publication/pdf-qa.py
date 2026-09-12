"""Render every publication PDF page for visual review; inspect text and metadata."""
import fitz
import json
import pathlib
import sys
out = pathlib.Path(sys.argv[1])
out.mkdir(parents=True, exist_ok=True)
results = []
for name in ['pelagic', 'supplement']:
    doc = fitz.open(f'paper/{name}.pdf')
    text = '\n'.join(page.get_text() for page in doc)
    assert '/home/' not in text and 'localhost:' not in text
    assert 'Mani Marami Milani' in text
    sheets = []
    for start in range(0, len(doc), 6):
        sheet = fitz.open()
        page = sheet.new_page(width=900, height=850)
        for n in range(start, min(start+6, len(doc))):
            index = n-start
            x, y = (index % 3)*300, (index // 3)*425
            pix = doc[n].get_pixmap(matrix=fitz.Matrix(1,1), alpha=False)
            page.insert_image(fitz.Rect(x+8,y+22,x+292,y+417), stream=pix.tobytes('png'))
            page.insert_text((x+12,y+15), f'{name} · page {n+1}', fontsize=10)
        target = out/f'{name}-pages-{start+1}.png'
        page.get_pixmap(matrix=fitz.Matrix(1.5,1.5), alpha=False).save(target)
        sheets.append(target.name)
    # Full-resolution representative cover, equation and last pages.
    for n in sorted(set([0, min(17,len(doc)-1),len(doc)-1])):
        doc[n].get_pixmap(matrix=fitz.Matrix(1.5,1.5), alpha=False).save(out/f'{name}-page-{n+1}.png')
    results.append({'name':name, 'pages':len(doc), 'metadata':doc.metadata,
                    'characters':len(text),'contactSheets':sheets})
(out/'pdf-inspection.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))

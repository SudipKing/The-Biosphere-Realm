#!/usr/bin/env python3
"""Bundle index.html + style.css + src/*.js into a single self-contained dist/the-biosphere-realm.html."""
import re, pathlib
root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text()
css = (root / "style.css").read_text()
order = re.findall(r'<script src="(src/[^"]+)"></script>', html)
js = "\n".join((root / p).read_text() for p in order)
bundle = "<script>\n(()=>{\n" + js + "\n})();\n</script>"
html = html.replace('<link rel="stylesheet" href="style.css">', "<style>\n" + css + "</style>")
html = re.sub(r"<!--SCRIPTS-->.*<!--/SCRIPTS-->", lambda m: bundle, html, flags=re.S)
out = root / "dist" / "the-biosphere-realm.html"
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(f"built {out} ({len(html)//1024} KB)")

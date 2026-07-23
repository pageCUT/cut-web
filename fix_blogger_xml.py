with open("blogger-dynamic.xml", "r", encoding="utf-8") as f:
    content = f.read()

# Replace any unescaped ampersand in the fonts URL properly
content = content.replace("https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap",
                          "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&amp;family=Barlow:wght@400;500;600;700&amp;family=Atkinson+Hyperlegible:wght@400;700&amp;display=swap")

# If it already had &amp; but we double escaped it somewhere, let's fix it by regex:
import re
# Find the exact link tag and replace it wholesale
content = re.sub(
    r'<link href="https://fonts.googleapis.com/css2\?family=Barlow\+Condensed:wght@400;700;900[^"]+" rel="stylesheet" />',
    r'<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&amp;family=Barlow:wght@400;500;600;700&amp;family=Atkinson+Hyperlegible:wght@400;700&amp;display=swap" rel="stylesheet" />',
    content
)

with open("blogger-dynamic.xml", "w", encoding="utf-8") as f:
    f.write(content)

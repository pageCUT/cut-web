import re
import html

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace relative URLs with absolute URLs
repo_url = "https://pageCUT.github.io/cut-web/"
content = content.replace('href="assets/', f'href="{repo_url}assets/')
content = content.replace("url('assets/", f"url('{repo_url}assets/")
content = content.replace('src="assets/', f'src="{repo_url}assets/')
content = content.replace('href="pages/', f'href="{repo_url}pages/')
content = content.replace('href="manifest.json"', f'href="{repo_url}manifest.json"')

# Make self-closing tags valid XML
def close_tags(match):
    tag = match.group(0)
    if not tag.endswith('/>') and not tag.endswith('>'):
        return tag + ' />'
    if tag.endswith('>') and not tag.endswith('/>'):
        return tag[:-1] + ' />'
    return tag

content = re.sub(r'<(meta|link|img|input|br|hr)\b[^>]*>', close_tags, content)

# Also fix the <html ...> to include blogger namespaces
html_tag = """<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateUrl='indie.xml' b:templateVersion='1.3.0' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>"""
content = re.sub(r'<html[^>]*>', html_tag, content)

# Add XML declaration at the top
if not content.startswith('<?xml'):
    content = '<?xml version="1.0" encoding="UTF-8" ?>\n' + content

# Fix valueless attributes (crossorigin -> crossorigin="anonymous", required -> required="required", etc.)
content = content.replace('crossorigin />', 'crossorigin="anonymous" />')
content = content.replace('novalidate>', 'novalidate="novalidate">')
content = content.replace('required>', 'required="required">')
content = content.replace('required />', 'required="required" />')
content = content.replace('data-years>', 'data-years="data-years">')

# Fix ampersands in URLs or scripts
content = content.replace('&&', '&amp;&amp;')
content = content.replace('900&family', '900&amp;family')
content = content.replace('700&family', '700&amp;family')
content = content.replace('700&display', '700&amp;display')

# Enclose scripts in CDATA sections if they contain problematic characters
def wrap_cdata(match):
    script_content = match.group(1)
    if '&' in script_content or '<' in script_content or '>' in script_content:
         # Blogger doesn't strictly require CDATA for script if we escape, but CDATA is safer
         return f"<script>//<![CDATA[\n{script_content}\n//]]></script>"
    return match.group(0)

content = re.sub(r'<script>(.*?)</script>', wrap_cdata, content, flags=re.DOTALL)

# Replace <style> with <b:skin>
style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL)
match = style_pattern.search(content)
if match:
    css = match.group(1)
    b_skin = f"<b:skin><![CDATA[{css}]]></b:skin>"
    content = style_pattern.sub(b_skin, content)

# Ensure there is a <b:section> in the body so Blogger doesn't complain
if '<b:section' not in content:
    content = content.replace('</body>', "<!-- Blogger requires at least one b:section -->\n<b:section id='main' class='main' showaddelement='yes'></b:section>\n</body>")

with open('blogger-template.xml', 'w', encoding='utf-8') as f:
    f.write(content)

print("Generated blogger-template.xml")

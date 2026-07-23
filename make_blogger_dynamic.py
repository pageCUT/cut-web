import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

REPO_ROOT = "https://pagecut.github.io/cut-web"

# Replace relative URLs with absolute URLs for assets
content = content.replace('href="assets/', f'href="{REPO_ROOT}/assets/')
content = content.replace("url('assets/", f"url('{REPO_ROOT}/assets/")
content = content.replace('src="assets/', f'src="{REPO_ROOT}/assets/')

# Make self-closing tags valid XML
def close_tags(match):
    tag = match.group(0)
    if not tag.endswith('/>') and not tag.endswith('>'):
        return tag + ' />'
    if tag.endswith('>') and not tag.endswith('/>'):
        return tag[:-1] + ' />'
    return tag

content = re.sub(r'<(meta|link|img|input|br|hr)\b[^>]*>', close_tags, content)

# Fix HTML tag for Blogger
html_tag = """<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateUrl='indie.xml' b:templateVersion='1.3.0' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>"""
content = re.sub(r'<html[^>]*>', html_tag, content)

# Add XML declaration
if not content.startswith('<?xml'):
    content = '<?xml version="1.0" encoding="UTF-8" ?>\n' + content

# Fix empty attributes
content = content.replace('crossorigin />', 'crossorigin="anonymous" />')
content = content.replace('novalidate>', 'novalidate="novalidate">')
content = content.replace('required>', 'required="required">')
content = content.replace('required />', 'required="required" />')
content = content.replace('data-years>', 'data-years="data-years">')

# Fix ampersands
content = content.replace('&&', '&amp;&amp;')
content = content.replace('900&family', '900&amp;family')
content = content.replace('700&family', '700&amp;family')
content = content.replace('700&display', '700&amp;display')

# CDATA for scripts
def wrap_cdata(match):
    script_content = match.group(1)
    if '&' in script_content or '<' in script_content or '>' in script_content:
         return f"<script>//<![CDATA[\n{script_content}\n//]]></script>"
    return match.group(0)

content = re.sub(r'<script>(.*?)</script>', wrap_cdata, content, flags=re.DOTALL)

# Style to b:skin
style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL)
match = style_pattern.search(content)
if match:
    css = match.group(1)
    b_skin = f"<b:skin><![CDATA[{css}]]></b:skin>"
    content = style_pattern.sub(b_skin, content)

# Adjust navigation for Blogger
# Instead of pages/publicaciones.html we point to /search/label/Publicaciones
content = content.replace('href="https://pagecut.github.io/cut-web/pages/publicaciones.html"', 'href="/search/label/Publicaciones"')
content = content.replace('href="https://pagecut.github.io/cut-web/pages/noticias.html"', 'href="/search/label/Noticias"')
content = content.replace('href="#inicio"', 'href="/"')

# Enclose main content in Blogger conditionals
main_start = '<main id="main-content">'
main_end = '</main>'

parts = content.split(main_start)
if len(parts) == 2:
    sub_parts = parts[1].split(main_end)
    static_html = sub_parts[0]

    dynamic_content = f"""
  <b:if cond='data:view.isHomepage'>
    {static_html}
  </b:if>
  <b:if cond='not data:view.isHomepage'>
    <div style="max-width: 1000px; margin: 120px auto 40px; padding: 0 2rem; min-height: 60vh;">
      <b:section id='main-blog' class='main-blog' showaddelement='yes'>
        <b:widget id='Blog1' locked='true' title='Entradas del blog' type='Blog' version='2' />
      </b:section>
    </div>
  </b:if>
"""
    content = parts[0] + main_start + dynamic_content + main_end + sub_parts[1]

with open('blogger-dynamic.xml', 'w', encoding='utf-8') as f:
    f.write(content)

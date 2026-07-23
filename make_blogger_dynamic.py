import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

REPO_ROOT = "https://pagecut.github.io/cut-web"

# Replace relative URLs with absolute URLs for assets
content = content.replace('href="assets/', f'href="{REPO_ROOT}/assets/')
content = content.replace("url('assets/", f"url('{REPO_ROOT}/assets/")
content = content.replace('src="assets/', f'src="{REPO_ROOT}/assets/')

# Update Navigation Links for Blogger explicitly.
# We will just change them all manually via regex or explicit replaces to ensure they are pointing to what the user expects.
content = content.replace('href="#inicio"', 'href="/"')
content = content.replace('href="#noticias"', 'href="/search/label/Noticias"')
content = content.replace('href="pages/publicaciones.html"', 'href="/search/label/Publicaciones"')
content = content.replace('href="#sobre"', 'href="/#sobre"')
content = content.replace('href="#sindicatos"', 'href="/#sindicatos"')
content = content.replace('href="#documentos"', 'href="/#documentos"')
content = content.replace('href="#contacto"', 'href="/#contacto"')
content = content.replace('href="pages/afiliacion.html"', 'href="https://pagecut.github.io/cut-web/pages/afiliacion.html"')

# Escape ampersands globally in specific tags before any other replace
content = content.replace('&family', '&amp;family')
content = content.replace('&display', '&amp;display')

# Make self-closing tags valid XML
def close_tags(match):
    tag = match.group(0)
    if not tag.endswith('/>') and not tag.endswith('>'):
        return tag + ' />'
    if tag.endswith('>') and not tag.endswith('/>'):
        return tag[:-1] + ' />'
    return tag

content = re.sub(r'<(meta|link|img|input|br|hr)\b[^>]*>', close_tags, content)

# Fix HTML tag for Blogger (using version 1 for widget to auto-populate default blogger blog widget)
html_tag = """<html b:css='false' b:defaultwidgetversion='1' b:layoutsVersion='1' b:responsive='true' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>"""
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

# Clean up possible double escapes in fonts URL
content = re.sub(
    r'<link href="https://fonts.googleapis.com/css2\?family=Barlow\+Condensed:wght@400;700;900[^"]+" rel="stylesheet" />',
    r'<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&amp;family=Barlow:wght@400;500;600;700&amp;family=Atkinson+Hyperlegible:wght@400;700&amp;display=swap" rel="stylesheet" />',
    content
)


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
    # Add some basic styling for the Blogger dynamic content
    extra_css = """
      .main-blog-container {
        max-width: 1100px;
        margin: 120px auto 40px;
        padding: 0 2rem;
        min-height: 60vh;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      }
      .post {
        margin-bottom: 2.5rem;
        padding-bottom: 2.5rem;
        border-bottom: 1px solid #eee;
      }
      .post-title {
        font-family: 'Barlow Condensed', sans-serif;
        font-weight: 700;
        font-size: 2rem;
        color: #111;
        margin-bottom: 1rem;
      }
      .post-title a { color: #C0001A; }
      .post-body {
        font-size: 1.05rem;
        color: #444;
        line-height: 1.7;
      }
      .post-footer {
        margin-top: 1rem;
        font-size: 13px;
        color: #888;
      }
      .blog-pager {
        display: flex;
        justify-content: space-between;
        margin-top: 2rem;
        padding: 1rem 0;
      }
    """
    b_skin = f"<b:skin><![CDATA[{css}\n{extra_css}]]></b:skin>"
    content = style_pattern.sub(b_skin, content)

# Enclose main content in Blogger conditionals
main_start = '<main id="main-content">'
main_end = '</main>'

parts = content.split(main_start)
if len(parts) == 2:
    sub_parts = parts[1].split(main_end)
    static_html = sub_parts[0]

    dynamic_content = f"""
  <b:if cond='data:blog.url == data:blog.homepageUrl'>
    {static_html}
  </b:if>
  <b:if cond='data:blog.url != data:blog.homepageUrl'>
    <div class="main-blog-container">
      <b:section id='main-blog' class='main-blog' showaddelement='yes'>
        <b:widget id='Blog1' locked='false' title='Entradas del blog' type='Blog' version='1'>
          <b:includable id='main' var='top'>
            <div class='blog-posts'>
              <b:loop values='data:posts' var='post'>
                <div class='post'>
                  <h2 class='post-title'>
                    <b:if cond='data:post.link'>
                      <a expr:href='data:post.link'><data:post.title/></a>
                    <b:else/>
                      <b:if cond='data:post.url'>
                        <a expr:href='data:post.url'><data:post.title/></a>
                      <b:else/>
                        <data:post.title/>
                      </b:if>
                    </b:if>
                  </h2>
                  <div class='post-meta'>
                    <span class='post-date'><data:post.dateHeader/></span>
                  </div>
                  <div class='post-body'>
                    <data:post.body/>
                  </div>
                  <div class='post-footer'>
                    <span class='post-labels'>
                      <b:if cond='data:post.labels'>
                        Etiquetas:
                        <b:loop values='data:post.labels' var='label'>
                          <a expr:href='data:label.url' rel='tag'><data:label.name/></a><b:if cond='not data:label.isLast'>, </b:if>
                        </b:loop>
                      </b:if>
                    </span>
                  </div>
                </div>
              </b:loop>
            </div>

            <div class='blog-pager' id='blog-pager'>
              <b:if cond='data:newerPageUrl'>
                <a class='blog-pager-newer-link' expr:href='data:newerPageUrl'>&#8592; Entradas más recientes</a>
              </b:if>
              <b:if cond='data:olderPageUrl'>
                <a class='blog-pager-older-link' expr:href='data:olderPageUrl'>Entradas antiguas &#8594;</a>
              </b:if>
            </div>
          </b:includable>
        </b:widget>
      </b:section>
    </div>
  </b:if>
"""
    content = parts[0] + main_start + dynamic_content + main_end + sub_parts[1]

with open('blogger-dynamic.xml', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dynamic XML generated")

/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Read and evaluate the main.js file in the jsdom environment
const mainJsPath = path.resolve(__dirname, '../assets/js/main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

// We evaluate the script so that it runs its IIFE and populates window variables if any,
// but since Security is defined as a var inside the IIFE, it doesn't leak.
// However, to test it robustly without regex hacking, we can modify the script
// slightly to expose it just for the test.

const scriptContent = mainJsContent.replace('var Security = {', 'window.Security = {');
eval(scriptContent);

describe('Security.escapeHtml', () => {
  it('should return empty string for non-string inputs', () => {
    expect(window.Security.escapeHtml(null)).toBe('');
    expect(window.Security.escapeHtml(undefined)).toBe('');
    expect(window.Security.escapeHtml(123)).toBe('');
    expect(window.Security.escapeHtml({})).toBe('');
    expect(window.Security.escapeHtml([])).toBe('');
  });

  it('should escape ampersand (&)', () => {
    expect(window.Security.escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('should escape less than (<) and greater than (>)', () => {
    expect(window.Security.escapeHtml('<div>')).toBe('&lt;div&gt;');
  });

  it('should escape double quotes (")', () => {
    expect(window.Security.escapeHtml('"hello"')).toBe('&quot;hello&quot;');
  });

  it('should escape single quotes (\')', () => {
    expect(window.Security.escapeHtml("'hello'")).toBe('&#x27;hello&#x27;');
  });

  it('should escape forward slash (/)', () => {
    expect(window.Security.escapeHtml('a/b')).toBe('a&#x2F;b');
  });

  it('should escape backtick (`)', () => {
    expect(window.Security.escapeHtml('`code`')).toBe('&#x60;code&#x60;');
  });

  it('should escape equals sign (=)', () => {
    expect(window.Security.escapeHtml('a=b')).toBe('a&#x3D;b');
  });

  it('should escape complex strings with multiple characters', () => {
    const input = '<script>alert("XSS" & \'test\')/`=</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot; &amp; &#x27;test&#x27;)&#x2F;&#x60;&#x3D;&lt;&#x2F;script&gt;';
    expect(window.Security.escapeHtml(input)).toBe(expected);
  });

  it('should return the original string if no special characters are present', () => {
    expect(window.Security.escapeHtml('hello world')).toBe('hello world');
  });
});

const { Security } = require('../assets/js/main');

describe('Security.sanitize', () => {
  it('should return the original string if it is normal', () => {
    expect(Security.sanitize('Hello, world!')).toBe('Hello, world!');
  });

  it('should return an empty string for non-string inputs', () => {
    expect(Security.sanitize(null)).toBe('');
    expect(Security.sanitize(undefined)).toBe('');
    expect(Security.sanitize(123)).toBe('');
    expect(Security.sanitize({})).toBe('');
    expect(Security.sanitize([])).toBe('');
  });

  it('should remove <script> tags and their contents', () => {
    expect(Security.sanitize('<script>alert("xss")</script>')).toBe('');
    expect(Security.sanitize('Hello <script>alert("xss")</script>world!')).toBe('Hello world!');
    expect(Security.sanitize('<SCRIPT>alert("xss")</SCRIPT>')).toBe('');
  });

  it('should remove javascript: URLs', () => {
    expect(Security.sanitize('javascript:alert("xss")')).toBe('alert("xss")');
    expect(Security.sanitize('JAVASCRIPT:alert("xss")')).toBe('alert("xss")');
  });

  it('should remove inline event handlers', () => {
    expect(Security.sanitize('onload=alert("xss")')).toBe('alert("xss")');
    expect(Security.sanitize('ONERROR=alert("xss")')).toBe('alert("xss")');
    expect(Security.sanitize('onmouseover = alert("xss")')).toBe('alert("xss")');
  });

  it('should remove data: URIs', () => {
    expect(Security.sanitize('data:text/html;base64,PHNjcmlwdD5hbGVydCgneHNzJyk8L3NjcmlwdD4=')).toBe('text/html;base64,PHNjcmlwdD5hbGVydCgneHNzJyk8L3NjcmlwdD4=');
    expect(Security.sanitize('DATA:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==')).toBe('image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==');
  });

  it('should truncate strings longer than 2000 characters', () => {
    const longString = 'a'.repeat(2500);
    expect(Security.sanitize(longString)).toHaveLength(2000);
    expect(Security.sanitize(longString)).toBe('a'.repeat(2000));
  });

  it('should trim whitespace from the beginning and end', () => {
    expect(Security.sanitize('  Hello, world!  ')).toBe('Hello, world!');
    expect(Security.sanitize('\n\nHello, world!\t\t')).toBe('Hello, world!');
  });
});

/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Security.checkHoneypot', () => {
  beforeAll(() => {
    // Load the main.js script into the JSDOM environment
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
    document.documentElement.innerHTML = html;
    const script = fs.readFileSync(path.resolve(__dirname, '../assets/js/main.js'), 'utf8');

    // Evaluate main.js so that window.Security is defined
    // Because it's an IIFE, our modification made it assign to window.Security
    window.eval(script);
  });

  let form;

  beforeEach(() => {
    form = document.createElement('form');
  });

  it('returns falsy if honeypot is not in the form', () => {
    // No honeypot added
    const result = window.Security.checkHoneypot(form);
    expect(result).toBeFalsy();
  });

  it('returns false if honeypot is present but empty', () => {
    window.Security.addHoneypot(form);
    const result = window.Security.checkHoneypot(form);
    expect(result).toBe(false);
  });

  it('returns true if honeypot is present and has a value', () => {
    window.Security.addHoneypot(form);
    const hp = form.querySelector('[name="website_url"]');
    hp.value = 'bot';

    const result = window.Security.checkHoneypot(form);
    expect(result).toBe(true);
  });
});

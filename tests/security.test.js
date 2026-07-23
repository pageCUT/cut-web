const { Security } = require('../assets/js/main.js');

describe('Security.addHoneypot', () => {
  let form;

  beforeEach(() => {
    // Set up a basic form element in the JSDOM environment
    document.body.innerHTML = '<form id="test-form"></form>';
    form = document.getElementById('test-form');
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  it('should append a honeypot input field when one does not exist', () => {
    expect(form.querySelector('[name="website_url"]')).toBeNull();
    Security.addHoneypot(form);
    const hp = form.querySelector('[name="website_url"]');
    expect(hp).not.toBeNull();
  });

  it('should set the correct attributes on the honeypot input', () => {
    Security.addHoneypot(form);
    const hp = form.querySelector('[name="website_url"]');

    expect(hp.type).toBe('text');
    expect(hp.name).toBe('website_url');
    expect(hp.autocomplete).toBe('off');
    expect(hp.tabIndex).toBe(-1);
    expect(hp.getAttribute('aria-hidden')).toBe('true');
    expect(hp.style.position).toBe('absolute');
    expect(hp.style.left).toBe('-9999px');
    expect(hp.style.width).toBe('1px');
    expect(hp.style.height).toBe('1px');
    expect(hp.style.opacity).toBe('0');
  });

  it('should not add a second honeypot input if one already exists', () => {
    Security.addHoneypot(form);
    const initialHpCount = form.querySelectorAll('[name="website_url"]').length;
    expect(initialHpCount).toBe(1);

    // Call it again
    Security.addHoneypot(form);
    const newHpCount = form.querySelectorAll('[name="website_url"]').length;
    expect(newHpCount).toBe(1); // Should still be 1
  });
});

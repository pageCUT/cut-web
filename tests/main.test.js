const { Security } = require('../assets/js/main.js');

describe('Security.rateLimit', () => {
  const windowMs = 5000; // 5 seconds for testing
  const maxRequests = 2;
  const key = 'test_key';
  const lsKey = `rl_${key}`;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows the first request', () => {
    const result = Security.rateLimit(key, maxRequests, windowMs);
    expect(result).toBe(true);

    // Check localStorage
    const stored = JSON.parse(localStorage.getItem(lsKey));
    expect(stored.requests).toHaveLength(1);
    expect(typeof stored.requests[0]).toBe('number');
  });

  it('allows multiple requests up to the maxRequests limit', () => {
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);

    const stored = JSON.parse(localStorage.getItem(lsKey));
    expect(stored.requests).toHaveLength(2);
  });

  it('blocks requests that exceed maxRequests within windowMs', () => {
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);

    // 3rd request should fail
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(false);

    const stored = JSON.parse(localStorage.getItem(lsKey));
    expect(stored.requests).toHaveLength(2);
  });

  it('allows new requests after windowMs has passed', () => {
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(false);

    // Advance time past the window
    jest.advanceTimersByTime(windowMs + 100);

    // Should be allowed now
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);

    const stored = JSON.parse(localStorage.getItem(lsKey));
    expect(stored.requests).toHaveLength(1);
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorage.setItem(lsKey, '{invalid json');

    // It should reset the data and allow the request
    expect(Security.rateLimit(key, maxRequests, windowMs)).toBe(true);

    const stored = JSON.parse(localStorage.getItem(lsKey));
    expect(stored.requests).toHaveLength(1);
  });

  it('handles disabled/unavailable localStorage without throwing', () => {
    // Mock localStorage.getItem to throw
    const originalGetItem = Storage.prototype.getItem;
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage disabled');
    });

    expect(() => {
      const result = Security.rateLimit(key, maxRequests, windowMs);
      expect(result).toBe(true); // Should fallback to memory and allow
    }).not.toThrow();

    Storage.prototype.getItem.mockRestore();
  });

  it('handles quota exceeded error on setItem without throwing', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    expect(() => {
      const result = Security.rateLimit(key, maxRequests, windowMs);
      expect(result).toBe(true);
    }).not.toThrow();

    Storage.prototype.setItem.mockRestore();
  });
});

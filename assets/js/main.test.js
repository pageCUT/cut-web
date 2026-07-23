const { Security } = require('./main.js');

describe('isValidEmail', () => {
  it('should return true for valid standard emails', () => {
    expect(Security.isValidEmail('test@example.com')).toBe(true);
    expect(Security.isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    expect(Security.isValidEmail('firstname.lastname@domain.com')).toBe(true);
    expect(Security.isValidEmail('email@subdomain.domain.com')).toBe(true);
    expect(Security.isValidEmail('1234567890@domain.com')).toBe(true);
    expect(Security.isValidEmail('email@domain-one.com')).toBe(true);
    expect(Security.isValidEmail('_______@domain.com')).toBe(true);
    expect(Security.isValidEmail('email@domain.name')).toBe(true);
    expect(Security.isValidEmail('email@domain.co.jp')).toBe(true);
    expect(Security.isValidEmail('firstname-lastname@domain.com')).toBe(true);
  });

  it('should return false for invalid emails', () => {
    expect(Security.isValidEmail('test')).toBe(false); // No @ or domain
    expect(Security.isValidEmail('test@')).toBe(false); // No domain
    expect(Security.isValidEmail('test@domain')).toBe(false); // No TLD
    expect(Security.isValidEmail('@example.com')).toBe(false); // No local part
    expect(Security.isValidEmail('test example@domain.com')).toBe(false); // Spaces are invalid
    expect(Security.isValidEmail('test@example com')).toBe(false); // Spaces in domain
    expect(Security.isValidEmail('test@example. com')).toBe(false); // Spaces in TLD
    expect(Security.isValidEmail('test@.com')).toBe(false); // No domain name
  });

  it('should handle edge case length constraints', () => {
    // Generate valid email of 254 chars length
    const exactValidLongEmail = 'a@' + 'a'.repeat(248) + '.com'; // 1 + 1 + 248 + 4 = 254 (valid!)
    const validLongEmail = 'a@' + 'a'.repeat(249) + '.com'; // 1 + 1 + 249 + 4 = 255 (too long!)

    expect(Security.isValidEmail(exactValidLongEmail)).toBe(true);
    expect(Security.isValidEmail(validLongEmail)).toBe(false); // Exceeds 254 chars
  });

  it('should return false for invalid input types', () => {
    // regex.test() short-circuits to false for null, undefined, so no length error occurs
    expect(Security.isValidEmail(null)).toBe(false);
    expect(Security.isValidEmail(undefined)).toBe(false);
    expect(Security.isValidEmail({})).toBe(false);
    expect(Security.isValidEmail(12345)).toBe(false);
  });
});

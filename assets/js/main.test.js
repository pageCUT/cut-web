const { Security } = require('./main.js');

describe('Security.isValidPhone', () => {
  it('should return true for a valid 8-digit phone number without formatting', () => {
    expect(Security.isValidPhone('22220000')).toBe(true);
    expect(Security.isValidPhone('88888888')).toBe(true);
  });

  it('should return true for a valid phone number with spaces', () => {
    expect(Security.isValidPhone('2222 0000')).toBe(true);
  });

  it('should return true for a valid phone number with dashes', () => {
    expect(Security.isValidPhone('2222-0000')).toBe(true);
  });

  it('should return true for a valid phone number with country code and plus sign', () => {
    expect(Security.isValidPhone('+506 2222 0000')).toBe(true);
    expect(Security.isValidPhone('+506 2222-0000')).toBe(true);
    expect(Security.isValidPhone('+1 800 123 4567')).toBe(true);
  });

  it('should return true for a valid phone number with parentheses', () => {
    expect(Security.isValidPhone('(506) 2222-0000')).toBe(true);
    expect(Security.isValidPhone('(800) 123-4567')).toBe(true);
  });

  it('should return false for a phone number that is too short', () => {
    expect(Security.isValidPhone('123456')).toBe(false); // Less than 7 characters
  });

  it('should return false for a phone number that is too long', () => {
    expect(Security.isValidPhone('+1 234 567 890 123 456 789')).toBe(false); // More than 20 characters
  });

  it('should return false for a phone number with invalid characters (letters)', () => {
    expect(Security.isValidPhone('2222-0000a')).toBe(false);
    expect(Security.isValidPhone('phone_number')).toBe(false);
  });

  it('should return false for a phone number with invalid special characters', () => {
    expect(Security.isValidPhone('2222*0000')).toBe(false);
    expect(Security.isValidPhone('2222@0000')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(Security.isValidPhone('')).toBe(false);
  });

  it('should return false for purely whitespace', () => {
    expect(Security.isValidPhone('   ')).toBe(false); // Less than 7 characters
  });

  // Note: the current regex /^[\d\s\+\-\(\)]{7,20}$/ allows strings of 7+ spaces,
  // which might be considered a bug. We are documenting the current behavior below.
  it.failing('should fail for strings containing only spaces (currently a known issue with the regex)', () => {
    expect(Security.isValidPhone('       ')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { isValidStellarPublicKey, isValidAssetCode, isValidAmount } from './validators';

describe('validators', () => {
  describe('isValidStellarPublicKey', () => {
    it('should return true for valid public keys', () => {
      expect(isValidStellarPublicKey('GC2QD526FH22P4YWQ3L7NGCIXLG3C76KPDOZK4QBA2YZZY62H2MAXMVI')).toBe(true);
      expect(isValidStellarPublicKey('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF')).toBe(true);
    });

    it('should return false for invalid public keys', () => {
      expect(isValidStellarPublicKey('GINVALIDKEY')).toBe(false); // Too short
      expect(isValidStellarPublicKey('GC2QD526FH22P4YWQ3L7NGCIXLG3C76KPDOZK4QBA2YZZY62H2MAXMVIA')).toBe(false); // Too long
      expect(isValidStellarPublicKey('SC2QD526FH22P4YWQ3L7NGCIXLG3C76KPDOZK4QBA2YZZY62H2MAXMVI')).toBe(false); // Invalid prefix (S instead of G)
      expect(isValidStellarPublicKey('GC2QD526FH22P4YWQ3L7NGCIXLG3C76KPDOZK4QBA2YZZY62H2MAXMV!')).toBe(false); // Invalid character
      expect(isValidStellarPublicKey('')).toBe(false);
      expect(isValidStellarPublicKey('12345')).toBe(false);
    });
  });

  describe('isValidAssetCode', () => {
    it('should return true for valid asset codes', () => {
      expect(isValidAssetCode('USD')).toBe(true);
      expect(isValidAssetCode('BTC')).toBe(true);
      expect(isValidAssetCode('TOKEN123')).toBe(true);
      expect(isValidAssetCode('a1')).toBe(true);
    });

    it('should return false for invalid asset codes', () => {
      expect(isValidAssetCode('')).toBe(false); // Empty
      expect(isValidAssetCode('TOOLONGTOKENCODE')).toBe(false); // Too long (max 12)
      expect(isValidAssetCode('token-usd')).toBe(false); // Invalid character '-'
      expect(isValidAssetCode('XLM!')).toBe(false); // Invalid character '!'
    });
  });

  describe('isValidAmount', () => {
    it('should return true for valid amounts', () => {
      expect(isValidAmount('100')).toBe(true);
      expect(isValidAmount('0.0000001')).toBe(true);
      expect(isValidAmount('123.456')).toBe(true);
    });

    it('should return false for invalid amounts', () => {
      expect(isValidAmount('0')).toBe(false); // Not positive
      expect(isValidAmount('-10')).toBe(false); // Negative
      expect(isValidAmount('abc')).toBe(false); // Not a number
      expect(isValidAmount('')).toBe(false); // Empty
      expect(isValidAmount('1.2.3')).toBe(false); // Invalid number format
    });
  });
});

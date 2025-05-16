import { isValidEmail, isValidName, isStrongPassword } from '@/utils/validation';
import { ExpoRoot } from 'expo-router';

describe('Validation Functions', () => {
    describe('isValidEmail', () => {
        it('should accept valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user_123@domain.co')).toBe(true);
            expect(isValidEmail('john.doe@example.co.uk')).toBe(true);
        });

        it('should reject invalid emails', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
            expect(isValidEmail('💥user@example.com')).toBe(false);
            expect(isValidEmail('user!@example.com')).toBe(false);
            expect(isValidEmail('user@com')).toBe(false);
        });
    });

    describe('isValidName', () => {
        it('should accept valid names', () => {
            expect(isValidName('John Doe')).toBe(true);
            expect(isValidName('John Smith')).toBe(true);
            expect(isValidName('Suzy Q')).toBe(true);
            expect(isValidName('Herman Li')).toBe(true);
        });

        it('should reject invalid names', () => {
            expect(isValidName('')).toBe(false);
            expect(isValidName('✌️')).toBe(false);
            expect(isValidName('A')).toBe(false);
            expect(isValidName('ThisNameIsWayTooLongToBeValidBecauseItHasMoreThanFiftyCharacters')).toBe(false);
        });
    });

    describe('isStrongPassword', () => {
        it('should accept strong passwords', () => {
            expect(isStrongPassword('Pass123')).toBe(true);
            expect(isStrongPassword('user2024')).toBe(true);
            expect(isStrongPassword('abcDEF123')).toBe(true);
        });

        it('should reject passwords that are too short or too long', () => {
            expect(isStrongPassword('123')).toBe(false);
            expect(isStrongPassword('')).toBe(false);
            expect(isStrongPassword('thispasswordiswaytoolongtobevalid')).toBe(false);
        });

        it('should reject passwords with only letters or only numbers', () => {
            expect(isStrongPassword('password')).toBe(false);
            expect(isStrongPassword('')).toBe(false);
            expect(isStrongPassword('12345678')).toBe(false);
        });

        it('should reject passwords with emojis or spaces', () => {
            expect(isStrongPassword('pass👍123')).toBe(false);
            expect(isStrongPassword('    ')).toBe(false);
            expect(isStrongPassword('abc 123')).toBe(false);
        });
    });
});

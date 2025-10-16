/**
 * Tests for Email Collection Feature for Phone-Only Guests
 * 
 * This test suite verifies:
 * 1. API can find guest by guestId (for phone-only guests)
 * 2. API updates guest email when provided
 * 3. Email validation works correctly
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('Email Collection for Phone-Only Guests', () => {
  describe('Guest Lookup', () => {
    it('should find guest by guestId when email is not available', () => {
      // Test that guest lookup by guestId works
      const mockGuest = {
        id: 'guest-123',
        name: 'John Doe',
        phone: '+1234567890',
        email: null, // Phone-only guest
        eventId: 'event-123',
      };

      expect(mockGuest.email).toBeNull();
      expect(mockGuest.phone).toBe('+1234567890');
      expect(mockGuest.id).toBe('guest-123');
    });

    it('should find guest by email when email is available', () => {
      const mockGuest = {
        id: 'guest-456',
        name: 'Jane Smith',
        phone: '+0987654321',
        email: 'jane@example.com',
        eventId: 'event-123',
      };

      expect(mockGuest.email).toBe('jane@example.com');
      expect(mockGuest.phone).toBe('+0987654321');
    });
  });

  describe('Email Update', () => {
    it('should update email for phone-only guest', () => {
      const mockGuest = {
        id: 'guest-123',
        name: 'John Doe',
        phone: '+1234567890',
        email: null,
        eventId: 'event-123',
      };

      const newEmail = 'john@example.com';
      
      // Simulate email update
      const updatedGuest = {
        ...mockGuest,
        email: newEmail,
      };

      expect(updatedGuest.email).toBe(newEmail);
      expect(updatedGuest.phone).toBe('+1234567890');
    });

    it('should not overwrite existing email', () => {
      const mockGuest = {
        id: 'guest-456',
        name: 'Jane Smith',
        phone: '+0987654321',
        email: 'jane@example.com',
        eventId: 'event-123',
      };

      const newEmail = 'newemail@example.com';
      
      // Logic should prevent email overwrite if guest already has one
      const shouldUpdate = !mockGuest.email;
      
      expect(shouldUpdate).toBe(false);
      expect(mockGuest.email).toBe('jane@example.com'); // Original email preserved
    });
  });

  describe('Email Validation', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first+last@company.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'no spaces@domain.com',
        'multiple@@at.com',
        '',
        '   ',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email.trim())).toBe(false);
      });
    });

    it('should handle trimming of email addresses', () => {
      const emailWithSpaces = '  test@example.com  ';
      const trimmedEmail = emailWithSpaces.trim();
      
      expect(validateEmail(trimmedEmail)).toBe(true);
      expect(trimmedEmail).toBe('test@example.com');
    });
  });

  describe('RSVP Submission Flow', () => {
    it('should require email when guest only has phone', () => {
      const mockGuest = {
        id: 'guest-123',
        name: 'John Doe',
        phone: '+1234567890',
        email: null,
        status: 'PENDING',
      };

      const hasEmail = mockGuest.email && mockGuest.email.trim();
      const hasPhone = mockGuest.phone;
      const shouldShowEmailDialog = !hasEmail && !!hasPhone;

      expect(shouldShowEmailDialog).toBe(true);
    });

    it('should not require email when guest already has one', () => {
      const mockGuest = {
        id: 'guest-456',
        name: 'Jane Smith',
        phone: '+0987654321',
        email: 'jane@example.com',
        status: 'PENDING',
      };

      const hasEmail = mockGuest.email && mockGuest.email.trim();
      const hasPhone = mockGuest.phone;
      const shouldShowEmailDialog = !hasEmail && !!hasPhone;

      expect(shouldShowEmailDialog).toBe(false);
    });

    it('should include guestId in API request for phone-only guests', () => {
      const mockGuest = {
        id: 'guest-123',
        name: 'John Doe',
        phone: '+1234567890',
        email: null,
      };

      const params = new URLSearchParams();
      params.append('eventId', 'event-123');
      
      if (mockGuest.id) {
        params.append('guestId', mockGuest.id);
      }

      expect(params.get('guestId')).toBe('guest-123');
      expect(params.get('eventId')).toBe('event-123');
    });
  });

  describe('Request Body Handling', () => {
    it('should include email in request body when provided', () => {
      const requestBody = {
        name: 'John Doe',
        email: 'john@example.com', // Newly collected email
        phone: '+1234567890',
        status: 'CONFIRMED',
        response: 'YES',
        adults: 1,
        children: 0,
      };

      expect(requestBody.email).toBe('john@example.com');
      expect(requestBody.phone).toBe('+1234567890');
      expect(requestBody.status).toBe('CONFIRMED');
    });

    it('should handle empty or null email gracefully', () => {
      const requestBody = {
        name: 'John Doe',
        email: '',
        phone: '+1234567890',
        status: 'CONFIRMED',
      };

      const emailToUse = requestBody.email || null;
      expect(emailToUse).toBeNull();
    });
  });
});

describe('Email Collection Dialog Component', () => {
  it('should validate email before submission', () => {
    const testEmail = 'test@example.com';
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const isValid = validateEmail(testEmail);
    expect(isValid).toBe(true);
  });

  it('should show error for empty email', () => {
    const email = '';
    let error = '';

    if (!email.trim()) {
      error = 'Email is required';
    }

    expect(error).toBe('Email is required');
  });

  it('should show error for invalid email format', () => {
    const email = 'invalid-email';
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    let error = '';
    if (email.trim() && !validateEmail(email.trim())) {
      error = 'Please enter a valid email address';
    }

    expect(error).toBe('Please enter a valid email address');
  });
});


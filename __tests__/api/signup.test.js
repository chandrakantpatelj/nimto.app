import { jest } from '@jest/globals';
import { NextResponse } from 'next/server';
import { POST } from '../../app/api/auth/signup/route.js';

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: jest.fn().mockResolvedValue(data),
      status: options?.status || 200,
      ...options,
    })),
  },
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  hashSync: jest.fn(),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  userRole: {
    findFirst: jest.fn(),
  },
  verificationToken: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

// Mock recaptcha
jest.mock('@/lib/recaptcha', () => ({
  verifyRecaptchaToken: jest.fn(),
}));

// Mock email service
jest.mock('@/services/send-email', () => ({
  sendEmail: jest.fn(),
}));

// Mock schema validation
jest.mock('@/app/(auth)/forms/signup-schema', () => ({
  getSignupSchema: jest.fn(() => ({
    safeParse: jest.fn(),
  })),
}));

// Mock user model
jest.mock('@/app/models/user', () => ({
  UserStatus: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
  },
}));

// Import mocked modules
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import { sendEmail } from '@/services/send-email';
import { getSignupSchema } from '@/app/(auth)/forms/signup-schema';
import { UserStatus } from '@/app/models/user';

describe('Signup API Route', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Set up test environment
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    
    // Default mock implementations
    bcrypt.hash.mockResolvedValue('hashed-password-123');
    bcrypt.hashSync.mockReturnValue('hashed-token-123');
    verifyRecaptchaToken.mockResolvedValue(true);
    
    // Mock schema validation success
    const mockSchema = {
      safeParse: jest.fn().mockReturnValue({
        success: true,
        data: {
          email: 'test@example.com',
          password: 'password123',
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true,
        },
      }),
    };
    getSignupSchema.mockReturnValue(mockSchema);
    
    // Mock Prisma responses
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.userRole.findFirst.mockResolvedValue({
      id: 'role-123',
      name: 'User',
      isDefault: true,
    });
    prisma.user.create.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      status: UserStatus.INACTIVE,
      role: { id: 'role-123', name: 'User' },
    });
    prisma.verificationToken.create.mockResolvedValue({
      identifier: 'user-123',
      token: 'hashed-token-123',
      expires: new Date(Date.now() + 3600000),
    });
    prisma.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
    
    // Mock email service
    sendEmail.mockResolvedValue();
  });

  // Helper function to create mock request
  const createMockRequest = (body, headers = {}) => ({
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn((key) => headers[key] || null),
    },
  });

  describe('Successful Registration', () => {
    it('should handle complete signup process successfully', async () => {
      const requestBody = {
        email: 'test@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        name: 'Test User',
        accept: true,
      };

      const mockReq = createMockRequest(requestBody, {
        'x-recaptcha-token': 'valid-recaptcha-token',
      });

      const response = await POST(mockReq);
      const responseData = await response.json();

      // Verify response structure
      expect(response.status).toBe(200);
      expect(responseData.message).toContain('Registration successful');

      // Verify all backend operations were called
      expect(verifyRecaptchaToken).toHaveBeenCalledWith('valid-recaptcha-token');
      expect(getSignupSchema().safeParse).toHaveBeenCalledWith(requestBody);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { role: true },
      });
      expect(prisma.userRole.findFirst).toHaveBeenCalledWith({
        where: { isDefault: true },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed-password-123',
          name: 'Test User',
          status: UserStatus.INACTIVE,
          roleId: 'role-123',
        },
        include: { role: true },
      });
      expect(prisma.verificationToken.create).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should hash password correctly', async () => {
      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'securePassword123!', 
          passwordConfirmation: 'securePassword123!',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      // Update the mock schema for this specific test
      const mockSchema = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: {
            email: 'test@example.com',
            password: 'securePassword123!',
            passwordConfirmation: 'securePassword123!',
            name: 'Test User',
            accept: true,
          },
        }),
      };
      getSignupSchema.mockReturnValue(mockSchema);

      await POST(mockReq);

      expect(bcrypt.hash).toHaveBeenCalledWith('securePassword123!', 10);
    });

    it('should create verification token with proper expiration', async () => {
      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      await POST(mockReq);

      expect(prisma.verificationToken.create).toHaveBeenCalledWith({
        data: {
          identifier: 'user-123',
          token: 'hashed-token-123',
          expires: expect.any(Date),
        },
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing reCAPTCHA token', async () => {
      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        {} // No reCAPTCHA token
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('reCAPTCHA verification required');
    });

    it('should handle invalid reCAPTCHA token', async () => {
      verifyRecaptchaToken.mockResolvedValue(false);

      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'invalid-token' }
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('reCAPTCHA verification failed');
    });

    it('should handle invalid input data', async () => {
      const mockSchema = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: { message: 'Invalid email format' },
        }),
      };
      getSignupSchema.mockReturnValue(mockSchema);

      const mockReq = createMockRequest(
        { 
          email: 'invalid-email', 
          password: '123', 
          passwordConfirmation: '123',
          name: '',
          accept: false
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.message).toBe('Invalid input. Please check your data and try again.');
    });

    it('should handle existing active user', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user-123',
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
        role: { id: 'role-123', name: 'User' },
      });

      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(409);
      expect(responseData.message).toBe('Email is already registered.');
    });

    it('should handle existing inactive user by resending verification email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'inactive-user-123',
        email: 'test@example.com',
        status: UserStatus.INACTIVE,
        role: { id: 'role-123', name: 'User' },
      });

      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.message).toBe('Verification email resent. Please check your email.');
      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { identifier: 'inactive-user-123' },
      });
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should handle missing default role', async () => {
      prisma.userRole.findFirst.mockResolvedValue(null);

      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.message).toBe('Registration failed. Please try again later.');
    });

    it('should handle email service failure gracefully', async () => {
      sendEmail.mockRejectedValue(new Error('SMTP connection failed'));

      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.message).toBe('Registration failed. Please try again later.');
    });

    it('should handle bcrypt hashing failure', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      const response = await POST(mockReq);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.message).toBe('Registration failed. Please try again later.');
    });
  });

  describe('Email Integration', () => {
    it('should send verification email with correct data', async () => {
      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      await POST(mockReq);

      expect(sendEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        subject: 'Account Activation',
        content: {
          title: 'Hello, Test User',
          subtitle: 'Click the below link to verify your email address and activate your account.',
          buttonLabel: 'Activate account',
          buttonUrl: 'http://localhost:3000/verify-email?token=hashed-token-123',
          description: 'This link is valid for 1 hour. If you did not request this email you can safely ignore it.',
        },
      });
    });

    it('should generate correct verification URL', async () => {
      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      await POST(mockReq);

      const emailCall = sendEmail.mock.calls[0][0];
      expect(emailCall.content.buttonUrl).toBe('http://localhost:3000/verify-email?token=hashed-token-123');
    });
  });

  describe('Security Features', () => {
    it('should hash passwords before storing', async () => {
      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'plaintext-password', 
          passwordConfirmation: 'plaintext-password',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      // Update the mock schema for this specific test
      const mockSchema = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: {
            email: 'test@example.com',
            password: 'plaintext-password',
            passwordConfirmation: 'plaintext-password',
            name: 'Test User',
            accept: true,
          },
        }),
      };
      getSignupSchema.mockReturnValue(mockSchema);

      await POST(mockReq);

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext-password', 10);
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: 'hashed-password-123', // Should be hashed, not plaintext
          }),
        })
      );
    });

    it('should generate secure verification tokens', async () => {
      const mockReq = createMockRequest(
        { 
          email: 'test@example.com', 
          password: 'password123', 
          passwordConfirmation: 'password123',
          name: 'Test User',
          accept: true
        },
        { 'x-recaptcha-token': 'valid-token' }
      );

      await POST(mockReq);

      expect(bcrypt.hashSync).toHaveBeenCalledWith('user-123', 10);
    });
  });
}); 
// Global test setup file

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Global test timeout
jest.setTimeout(10000); 
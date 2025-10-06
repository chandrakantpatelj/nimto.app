import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client before importing the API
const mockPrisma = {
  event: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  guest: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Mock S3 utils
jest.mock('@/lib/s3-utils', () => ({
  generateS3Url: jest.fn((path) => `https://s3.amazonaws.com/bucket/${path}`),
}));

// Import the API after mocking
const { GET, POST } = require('@/app/api/events/route');

describe('Events API', () => {
  let mockRequest;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Mock console.error to avoid noise in tests
    console.error = jest.fn();
  });

  describe('GET /api/events', () => {
    it('should return empty array when no events exist', async () => {
      // Mock empty result
      mockPrisma.event.findMany.mockResolvedValue([]);

      // Create mock request
      mockRequest = new NextRequest('http://localhost:3000/api/events');

      // Call the API
      const response = await GET(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          guests: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              response: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return events with proper structure', async () => {
      // Mock events data
      const mockEvents = [
        {
          id: 'event1',
          title: 'Test Event 1',
          description: 'Test Description 1',
          date: new Date('2024-01-15'),
          time: '14:00',
          location: 'Test Location 1',
          status: 'PUBLISHED',
          createdByUserId: 'user1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          imagePath: 'events/event1.jpg',
          guests: [
            {
              id: 'guest1',
              name: 'Guest 1',
              email: 'guest1@test.com',
              status: 'CONFIRMED',
              response: 'YES',
            },
          ],
          User: {
            id: 'user1',
            name: 'Test User',
            email: 'user@test.com',
          },
        },
        {
          id: 'event2',
          title: 'Test Event 2',
          description: 'Test Description 2',
          date: new Date('2024-01-20'),
          time: '15:00',
          location: 'Test Location 2',
          status: 'DRAFT',
          createdByUserId: 'user2',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          imagePath: null,
          guests: [],
          User: {
            id: 'user2',
            name: 'Test User 2',
            email: 'user2@test.com',
          },
        },
      ];

      mockPrisma.event.findMany.mockResolvedValue(mockEvents);

      // Create mock request
      mockRequest = new NextRequest('http://localhost:3000/api/events');

      // Call the API
      const response = await GET(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);

      // Check first event
      expect(data.data[0].id).toBe('event1');
      expect(data.data[0].title).toBe('Test Event 1');
      expect(data.data[0].s3ImageUrl).toBe(
        '/api/image-proxy?url=https://s3.amazonaws.com/bucket/events/event1.jpg',
      );
      expect(data.data[0].guests).toHaveLength(1);
      expect(data.data[0].User.name).toBe('Test User');

      // Check second event (no image)
      expect(data.data[1].id).toBe('event2');
      expect(data.data[1].title).toBe('Test Event 2');
      expect(data.data[1].s3ImageUrl).toBeUndefined();
      expect(data.data[1].guests).toHaveLength(0);
    });

    it('should filter events by status', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);

      // Create mock request with status filter
      mockRequest = new NextRequest(
        'http://localhost:3000/api/events?status=PUBLISHED',
      );

      // Call the API
      await GET(mockRequest);

      // Check that the filter was applied
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { status: 'PUBLISHED' },
        include: {
          guests: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              response: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter events by search query', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);

      // Create mock request with search filter
      mockRequest = new NextRequest(
        'http://localhost:3000/api/events?search=test',
      );

      // Call the API
      await GET(mockRequest);

      // Check that the search filter was applied
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { location: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        include: {
          guests: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              response: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter events by createdByUserId', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);

      // Create mock request with user filter
      mockRequest = new NextRequest(
        'http://localhost:3000/api/events?createdByUserId=user1',
      );

      // Call the API
      await GET(mockRequest);

      // Check that the user filter was applied
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: { createdByUserId: 'user1' },
        include: {
          guests: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              response: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should handle database connection errors gracefully', async () => {
      // Mock database error
      const dbError = new Error('Database connection failed');
      dbError.code = 'P2021';
      mockPrisma.event.findMany.mockRejectedValue(dbError);

      // Create mock request
      mockRequest = new NextRequest('http://localhost:3000/api/events');

      // Call the API
      const response = await GET(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle missing table errors gracefully', async () => {
      // Mock table not found error
      const tableError = new Error('relation "Event" does not exist');
      mockPrisma.event.findMany.mockRejectedValue(tableError);

      // Create mock request
      mockRequest = new NextRequest('http://localhost:3000/api/events');

      // Call the API
      const response = await GET(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should handle other database errors with 500 status', async () => {
      // Mock other database error
      const otherError = new Error('Some other database error');
      mockPrisma.event.findMany.mockRejectedValue(otherError);

      // Create mock request
      mockRequest = new NextRequest('http://localhost:3000/api/events');

      // Call the API
      const response = await GET(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch events');
    });

    it('should handle multiple query parameters', async () => {
      mockPrisma.event.findMany.mockResolvedValue([]);

      // Create mock request with multiple filters
      mockRequest = new NextRequest(
        'http://localhost:3000/api/events?status=PUBLISHED&search=test&createdByUserId=user1',
      );

      // Call the API
      await GET(mockRequest);

      // Check that all filters were applied
      expect(mockPrisma.event.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PUBLISHED',
          createdByUserId: 'user1',
          OR: [
            { title: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
            { location: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        include: {
          guests: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              response: true,
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('POST /api/events', () => {
    it('should create a new event successfully', async () => {
      const mockEvent = {
        id: 'new-event',
        title: 'New Event',
        description: 'New Event Description',
        startDateTime: new Date('2024-02-01'),
        locationAddress: 'New Location',
        status: 'DRAFT',
        createdByUserId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        User: {
          id: 'user1',
          name: 'Test User',
          email: 'user@test.com',
        },
      };

      mockPrisma.event.create.mockResolvedValue(mockEvent);

      // Create mock request with event data
      const eventData = {
        title: 'New Event',
        description: 'New Event Description',
        startDateTime: '2024-02-01',
        locationAddress: 'New Location',
        status: 'DRAFT',
        createdByUserId: 'user1',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      // Call the API
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Event');
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          ...eventData,
          startDateTime: new Date('2024-02-01'),
          endDateTime: null,
          locationUnit: undefined,
          showMap: true,
          templateId: undefined,
          jsonContent: undefined,
          imagePath: undefined,
          isTrashed: false,
          // Event features with defaults
          privateGuestList: false,
          allowPlusOnes: false,
          allowMaybeRSVP: true,
          allowFamilyHeadcount: false,
          limitEventCapacity: false,
          maxEventCapacity: 0,
          maxPlusOnes: 0,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should create an event with custom event features', async () => {
      const mockEvent = {
        id: 'new-event',
        title: 'New Event',
        description: 'New Event Description',
        startDateTime: new Date('2024-02-01'),
        locationAddress: 'New Location',
        status: 'DRAFT',
        createdByUserId: 'user1',
        privateGuestList: true,
        allowPlusOnes: true,
        allowMaybeRSVP: false,
        allowFamilyHeadcount: true,
        limitEventCapacity: true,
        maxEventCapacity: 50,
        maxPlusOnes: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        User: {
          id: 'user1',
          name: 'Test User',
          email: 'user@test.com',
        },
      };

      mockPrisma.event.create.mockResolvedValue(mockEvent);

      // Create mock request with event data including features
      const eventData = {
        title: 'New Event',
        description: 'New Event Description',
        startDateTime: '2024-02-01',
        locationAddress: 'New Location',
        status: 'DRAFT',
        createdByUserId: 'user1',
        privateGuestList: true,
        allowPlusOnes: true,
        allowMaybeRSVP: false,
        allowFamilyHeadcount: true,
        limitEventCapacity: true,
        maxEventCapacity: 50,
        maxPlusOnes: 2,
      };

      mockRequest = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      // Call the API
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Event');
      expect(mockPrisma.event.create).toHaveBeenCalledWith({
        data: {
          ...eventData,
          startDateTime: new Date('2024-02-01'),
          endDateTime: null,
          locationUnit: undefined,
          showMap: true,
          templateId: undefined,
          jsonContent: undefined,
          imagePath: undefined,
          isTrashed: false,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });

    it('should handle creation errors', async () => {
      mockPrisma.event.create.mockRejectedValue(new Error('Creation failed'));

      const eventData = {
        title: 'New Event',
        createdByUserId: 'user1',
      };

      mockRequest = new NextRequest('http://localhost:3000/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });

      // Call the API
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create event');
    });
  });
});

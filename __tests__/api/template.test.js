import { NextRequest } from 'next/server';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

// Mock Prisma
const mockPrisma = {
  template: {
    findMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Mock NextAuth
const mockGetServerSession = jest.fn();
jest.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}));

// Mock File constructor for Node.js environment
global.File = class MockFile {
  constructor(content, filename, options = {}) {
    this.name = filename;
    this.type = options.type || 'application/octet-stream';
    this.size = content.length;
    this.content = content;
  }

  async arrayBuffer() {
    return Buffer.from(this.content);
  }
};

// Mock FormData
global.FormData = class MockFormData {
  constructor() {
    this.data = new Map();
  }

  append(key, value) {
    this.data.set(key, value);
  }

  get(key) {
    return this.data.get(key);
  }
};

// Import the handlers
let GET, POST, PUT, DELETE;

describe('Template API', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks
    mockPrisma.template.findMany.mockReset();
    mockPrisma.template.create.mockReset();
    mockPrisma.template.findFirst.mockReset();
    mockPrisma.template.update.mockReset();
    mockPrisma.template.count.mockReset();
    mockGetServerSession.mockReset();
  });

  describe('GET /api/template', () => {
    beforeEach(async () => {
      const { GET: getHandler } = await import('@/app/api/template/route');
      GET = getHandler;
    });

    it('should fetch all templates without pagination', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Birthday Bash',
          category: 'Birthday',
          jsonContent: JSON.stringify([]),
          backgroundStyle: null,
          htmlContent: null,
          background: '#fef3c7',
          pageBackground: null,
          previewImageUrl: 'https://example.com/image.jpg',
          isPremium: false,
          price: 0,
          isSystemTemplate: false,
          createdByUserId: 'user1',
          createdAt: '2025-08-07T11:06:48.548Z',
          updatedAt: '2025-08-07T11:06:48.548Z',
          isTrashed: false,
          imagePath: null,
        },
      ];

      mockPrisma.template.findMany.mockResolvedValue(mockTemplates);
      mockPrisma.template.count.mockResolvedValue(mockTemplates.length);

      const request = new NextRequest('http://localhost:3000/api/template');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTemplates);
      expect(data.pagination).toBeUndefined();
    });

    it('should filter templates by category', async () => {
      const mockTemplates = [
        {
          id: '1',
          name: 'Birthday Bash',
          category: 'Birthday',
          jsonContent: JSON.stringify([]),
          backgroundStyle: null,
          htmlContent: null,
          background: '#fef3c7',
          pageBackground: null,
          previewImageUrl: 'https://example.com/image.jpg',
          isPremium: false,
          price: 0,
          isSystemTemplate: false,
          createdByUserId: 'user1',
          createdAt: '2025-08-07T11:06:48.548Z',
          updatedAt: '2025-08-07T11:06:48.548Z',
          isTrashed: false,
          imagePath: null,
        },
      ];

      mockPrisma.template.findMany.mockResolvedValue(mockTemplates);
      mockPrisma.template.count.mockResolvedValue(mockTemplates.length);

      const request = new NextRequest(
        'http://localhost:3000/api/template?category=Birthday',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.template.findMany).toHaveBeenCalledWith({
        where: {
          isTrashed: false,
          category: 'Birthday',
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter templates by premium status', async () => {
      const mockTemplates = [];
      mockPrisma.template.findMany.mockResolvedValue(mockTemplates);
      mockPrisma.template.count.mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost:3000/api/template?isPremium=true',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.template.findMany).toHaveBeenCalledWith({
        where: {
          isTrashed: false,
          isPremium: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should search templates by name, category, keywords, and tags', async () => {
      const mockTemplates = [];
      mockPrisma.template.findMany.mockResolvedValue(mockTemplates);
      mockPrisma.template.count.mockResolvedValue(0);

      const request = new NextRequest(
        'http://localhost:3000/api/template?search=birthday',
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockPrisma.template.findMany).toHaveBeenCalledWith({
        where: {
          isTrashed: false,
          isFeatured: true,
          OR: [
            { name: { contains: 'birthday', mode: 'insensitive' } },
            { category: { contains: 'birthday', mode: 'insensitive' } },
            { badge: { contains: 'birthday', mode: 'insensitive' } },
            { keywords: { has: 'birthday' } },
            { tags: { has: 'birthday' } },
          ],
        },
        orderBy: [
          { isTrending: 'desc' },
          { isNew: 'desc' },
          { popularity: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 50,
        skip: 0,
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.template.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      const request = new NextRequest('http://localhost:3000/api/template');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch templates');
    });
  });

  describe('POST /api/template/create-template', () => {
    beforeEach(async () => {
      const { POST: postHandler } = await import(
        '@/app/api/template/create-template/route'
      );
      POST = postHandler;
    });

    it('should create a new template successfully', async () => {
      const mockSession = {
        user: { id: 'user1' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const mockTemplate = {
        id: '1',
        name: 'Birthday Bash',
        category: 'Birthday',
        jsonContent: JSON.stringify([
          {
            id: 'bb_header',
            type: 'SectionHeader',
            value: "It's a Party!",
            position: { x: 20, y: 20 },
            size: { width: 300, height: 50 },
            styles: { fontSize: '40px', color: '#ff69b4', textAlign: 'center' },
            zIndex: 0,
          },
        ]),
        backgroundStyle: null,
        htmlContent: '<div>Birthday content</div>',
        background: '#fef3c7',
        pageBackground: null,
        previewImageUrl: 'https://example.com/image.jpg',
        isPremium: false,
        price: 0,
        isSystemTemplate: false,
        createdByUserId: 'user1',
        createdAt: '2025-08-07T11:09:57.600Z',
        updatedAt: '2025-08-07T11:09:57.600Z',
        isTrashed: false,
        imagePath: null,
      };

      mockPrisma.template.create.mockResolvedValue(mockTemplate);

      const templateData = {
        name: 'Birthday Bash',
        category: 'Birthday',
        tags: ['Wedding', 'Party', 'Celebration'],
        content: [
          {
            id: 'bb_header',
            type: 'SectionHeader',
            value: "It's a Party!",
            position: { x: 20, y: 20 },
            size: { width: 300, height: 50 },
            styles: { fontSize: '40px', color: '#ff69b4', textAlign: 'center' },
            zIndex: 0,
          },
        ],
        backgroundStyle: null,
        htmlContent: '<div>Birthday content</div>',
        background: '#fef3c7',
        pageBackground: null,
        previewImageUrl: 'https://example.com/image.jpg',
        isPremium: false,
        price: 0,
        isSystemTemplate: false,
        imagePath: null,
      };

      const request = new NextRequest(
        'http://localhost:3000/api/template/create-template',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockTemplate);
      expect(mockPrisma.template.create).toHaveBeenCalledWith({
        data: {
          name: 'Birthday Bash',
          category: 'Birthday',
          jsonContent: JSON.stringify(templateData.content),
          backgroundStyle: null,
          htmlContent: '<div>Birthday content</div>',
          background: '#fef3c7',
          pageBackground: null,
          previewImageUrl: 'https://example.com/image.jpg',
          isPremium: false,
          price: 0,
          isSystemTemplate: false,
          tags: ['Wedding', 'Party', 'Celebration'],
          imagePath: null,
          createdByUserId: 'user1',
        },
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const templateData = {
        name: 'Birthday Bash',
        category: 'Birthday',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/template/create-template',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 when required fields are missing', async () => {
      const mockSession = {
        user: { id: 'user1' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const templateData = {
        name: 'Birthday Bash',
        // Missing category
      };

      const request = new NextRequest(
        'http://localhost:3000/api/template/create-template',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Name and category are required');
    });

    it('should handle database errors during creation', async () => {
      const mockSession = {
        user: { id: 'user1' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.template.create.mockRejectedValue(new Error('Database error'));

      const templateData = {
        name: 'Birthday Bash',
        category: 'Birthday',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/template/create-template',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create template');
    });
  });

  describe('GET /api/template/[id]', () => {
    beforeEach(async () => {
      const { GET: getHandler } = await import('@/app/api/template/[id]/route');
      GET = getHandler;
    });

    it('should fetch a specific template', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Birthday Bash',
        category: 'Birthday',
        jsonContent: JSON.stringify([
          {
            id: 'bb_header',
            type: 'SectionHeader',
            value: "It's a Party!",
          },
        ]),
        backgroundStyle: null,
        htmlContent: '<div>Birthday content</div>',
        background: '#fef3c7',
        pageBackground: null,
        previewImageUrl: 'https://example.com/image.jpg',
        isPremium: false,
        price: 0,
        isSystemTemplate: false,
        createdByUserId: 'user1',
        createdAt: '2025-08-07T11:09:57.600Z',
        updatedAt: '2025-08-07T11:09:57.600Z',
        isTrashed: false,
        imagePath: null,
      };

      mockPrisma.template.findFirst.mockResolvedValue(mockTemplate);

      const request = new NextRequest('http://localhost:3000/api/template/1');
      const response = await GET(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.content).toEqual(JSON.parse(mockTemplate.jsonContent));
      expect(mockPrisma.template.findFirst).toHaveBeenCalledWith({
        where: {
          id: '1',
          isTrashed: false,
        },
      });
    });

    it('should return 404 when template is not found', async () => {
      mockPrisma.template.findFirst.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/template/999');
      const response = await GET(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Template not found');
    });

    it('should handle JSON parsing errors', async () => {
      const mockTemplate = {
        id: '1',
        name: 'Birthday Bash',
        category: 'Birthday',
        jsonContent: 'invalid json',
        backgroundStyle: null,
        htmlContent: '<div>Birthday content</div>',
        background: '#fef3c7',
        pageBackground: null,
        previewImageUrl: 'https://example.com/image.jpg',
        isPremium: false,
        price: 0,
        isSystemTemplate: false,
        createdByUserId: 'user1',
        createdAt: '2025-08-07T11:09:57.600Z',
        updatedAt: '2025-08-07T11:09:57.600Z',
        isTrashed: false,
        imagePath: null,
      };

      mockPrisma.template.findFirst.mockResolvedValue(mockTemplate);

      const request = new NextRequest('http://localhost:3000/api/template/1');
      const response = await GET(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch template');
    });
  });

  describe('PUT /api/template/[id]', () => {
    beforeEach(async () => {
      const { PUT: putHandler } = await import('@/app/api/template/[id]/route');
      PUT = putHandler;
    });

    it('should update a template successfully', async () => {
      const mockSession = {
        user: { id: 'user1' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const existingTemplate = {
        id: '1',
        name: 'Birthday Bash',
        category: 'Birthday',
        jsonContent: JSON.stringify([]),
        backgroundStyle: null,
        htmlContent: '<div>Old content</div>',
        background: '#fef3c7',
        pageBackground: null,
        previewImageUrl: 'https://example.com/old.jpg',
        isPremium: false,
        price: 0,
        isSystemTemplate: false,
        createdByUserId: 'user1',
        createdAt: '2025-08-07T11:09:57.600Z',
        updatedAt: '2025-08-07T11:09:57.600Z',
        isTrashed: false,
        imagePath: null,
      };

      const updatedTemplate = {
        ...existingTemplate,
        name: 'Updated Birthday Bash',
        htmlContent: '<div>New content</div>',
        isPremium: true,
        price: 20,
      };

      mockPrisma.template.findFirst.mockResolvedValue(existingTemplate);
      mockPrisma.template.update.mockResolvedValue(updatedTemplate);

      const updateData = {
        name: 'Updated Birthday Bash',
        htmlContent: '<div>New content</div>',
        isPremium: true,
        price: 20,
      };

      const request = new NextRequest('http://localhost:3000/api/template/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(updatedTemplate);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/template/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when template is not found', async () => {
      const mockSession = {
        user: { id: 'user1' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.template.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/template/999',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'Updated' }),
        },
      );

      const response = await PUT(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Template not found');
    });
  });

  describe('DELETE /api/template/[id]', () => {
    beforeEach(async () => {
      const { DELETE: deleteHandler } = await import(
        '@/app/api/template/[id]/route'
      );
      DELETE = deleteHandler;
    });

    it('should soft delete a template successfully', async () => {
      const mockSession = {
        user: { id: 'user1' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const existingTemplate = {
        id: '1',
        name: 'Birthday Bash',
        category: 'Birthday',
        isTrashed: false,
      };

      mockPrisma.template.findFirst.mockResolvedValue(existingTemplate);
      mockPrisma.template.update.mockResolvedValue({
        ...existingTemplate,
        isTrashed: true,
      });

      const request = new NextRequest('http://localhost:3000/api/template/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Template deleted successfully');
      expect(mockPrisma.template.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isTrashed: true },
      });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/template/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when template is not found', async () => {
      const mockSession = {
        user: { id: 'user1' },
      };
      mockGetServerSession.mockResolvedValue(mockSession);
      mockPrisma.template.findFirst.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/template/999',
        {
          method: 'DELETE',
        },
      );

      const response = await DELETE(request, { params: { id: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Template not found');
    });
  });
});

describe('Template Upload API', () => {
  let POST;

  beforeEach(async () => {
    const { POST: postHandler } = await import(
      '@/app/api/template/upload/route'
    );
    POST = postHandler;
  });

  it('should upload image successfully', async () => {
    const mockSession = {
      user: { id: 'user1' },
    };
    mockGetServerSession.mockResolvedValue(mockSession);

    // Mock file
    const mockFile = new File(['test image content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    // Mock FormData
    const mockFormData = new FormData();
    mockFormData.append('image', mockFile);

    // Mock fs promises
    const mockWriteFile = jest.fn().mockResolvedValue();
    const mockMkdir = jest.fn().mockResolvedValue();
    jest.doMock('fs/promises', () => ({
      writeFile: mockWriteFile,
      mkdir: mockMkdir,
    }));

    // Mock fs
    const mockExistsSync = jest.fn().mockReturnValue(true);
    jest.doMock('fs', () => ({
      existsSync: mockExistsSync,
    }));

    const request = new NextRequest(
      'http://localhost:3000/api/template/upload',
      {
        method: 'POST',
        body: mockFormData,
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('imagePath');
    expect(data.data).toHaveProperty('fileName');
    expect(data.data).toHaveProperty('fileSize');
    expect(data.data).toHaveProperty('fileType');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null);

    const mockFormData = new FormData();
    const request = new NextRequest(
      'http://localhost:3000/api/template/upload',
      {
        method: 'POST',
        body: mockFormData,
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 when no image is provided', async () => {
    const mockSession = {
      user: { id: 'user1' },
    };
    mockGetServerSession.mockResolvedValue(mockSession);

    const mockFormData = new FormData();
    const request = new NextRequest(
      'http://localhost:3000/api/template/upload',
      {
        method: 'POST',
        body: mockFormData,
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('No image file provided');
  });

  it('should return 400 for invalid file type', async () => {
    const mockSession = {
      user: { id: 'user1' },
    };
    mockGetServerSession.mockResolvedValue(mockSession);

    const mockFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    });

    const mockFormData = new FormData();
    mockFormData.append('image', mockFile);

    const request = new NextRequest(
      'http://localhost:3000/api/template/upload',
      {
        method: 'POST',
        body: mockFormData,
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid file type');
  });

  it('should return 400 for file too large', async () => {
    const mockSession = {
      user: { id: 'user1' },
    };
    mockGetServerSession.mockResolvedValue(mockSession);

    // Create a file larger than 5MB
    const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
    const mockFile = new File([largeContent], 'large-image.jpg', {
      type: 'image/jpeg',
    });
    // Override the size to be larger than 5MB
    Object.defineProperty(mockFile, 'size', {
      value: 6 * 1024 * 1024, // 6MB
      writable: false,
    });

    const mockFormData = new FormData();
    mockFormData.append('image', mockFile);

    const request = new NextRequest(
      'http://localhost:3000/api/template/upload',
      {
        method: 'POST',
        body: mockFormData,
      },
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('File size too large');
  });
});

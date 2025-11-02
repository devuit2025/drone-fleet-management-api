import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { SearchController } from './search.controller';
import { SearchService, GlobalSearchResult } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('SearchController', () => {
  let app: INestApplication;
  let searchService: SearchService;
  let module: TestingModule;

  const mockSearchService = {
    searchAll: jest.fn(),
    getSearchCounts: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    searchService = module.get<SearchService>(SearchService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/search', () => {
    const mockResults: GlobalSearchResult[] = [
      {
        type: 'drone',
        id: 1,
        title: 'DJI Mavic Pro',
        subtitle: 'Serial: DJI-001 | Status: available',
        data: {
          id: 1,
          name: 'DJI Mavic Pro',
          serialNumber: 'DJI-001',
          status: 'available',
        },
      },
      {
        type: 'user',
        id: 5,
        title: 'John Doe',
        subtitle: 'john@example.com',
        data: {
          id: 5,
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      {
        type: 'pilot',
        id: 3,
        title: 'Pilot #3',
        subtitle: 'LIC-12345',
        data: {
          id: 3,
          licenseNumber: 'LIC-12345',
        },
      },
    ];

    it('should search across all entities with query term', async () => {
      mockSearchService.searchAll.mockResolvedValue(mockResults);

      const response = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'DJI' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3);
      expect(response.body[0].type).toBe('drone');
      expect(response.body[0].title).toBe('DJI Mavic Pro');
      expect(response.body[1].type).toBe('user');
      expect(response.body[2].type).toBe('pilot');

      expect(mockSearchService.searchAll).toHaveBeenCalledWith('DJI', {
        limitPerEntity: 10,
        entities: undefined,
      });
    });

    it('should search with custom limit per entity', async () => {
      mockSearchService.searchAll.mockResolvedValue(mockResults.slice(0, 2));

      const response = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'DJI', limit: '5' })
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(mockSearchService.searchAll).toHaveBeenCalledWith('DJI', {
        limitPerEntity: 5,
        entities: undefined,
      });
    });

    it('should search with entities filter', async () => {
      const filteredResults = [mockResults[0], mockResults[1]]; // Only drone and user
      mockSearchService.searchAll.mockResolvedValue(filteredResults);

      const response = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'DJI', entities: 'drone,user' })
        .expect(200);

      expect(response.body.length).toBe(2);
      expect(response.body.every(r => r.type === 'drone' || r.type === 'user')).toBe(true);
      expect(mockSearchService.searchAll).toHaveBeenCalledWith('DJI', {
        limitPerEntity: 10,
        entities: ['drone', 'user'],
      });
    });

    it('should return empty array for empty query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: '' })
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockSearchService.searchAll).not.toHaveBeenCalled();
    });

    it('should return empty array for whitespace-only query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: '   ' })
        .expect(200);

      expect(response.body).toEqual([]);
      expect(mockSearchService.searchAll).not.toHaveBeenCalled();
    });

    it('should trim query term before searching', async () => {
      mockSearchService.searchAll.mockResolvedValue(mockResults);

      await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: '  DJI  ' })
        .expect(200);

      expect(mockSearchService.searchAll).toHaveBeenCalledWith('DJI', {
        limitPerEntity: 10,
        entities: undefined,
      });
    });

    it('should handle multiple entity types in entities filter', async () => {
      mockSearchService.searchAll.mockResolvedValue(mockResults);

      await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'test', entities: 'drone,user,pilot,mission' })
        .expect(200);

      expect(mockSearchService.searchAll).toHaveBeenCalledWith('test', {
        limitPerEntity: 10,
        entities: ['drone', 'user', 'pilot', 'mission'],
      });
    });

    it('should parse limit as integer', async () => {
      mockSearchService.searchAll.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'test', limit: '20' })
        .expect(200);

      expect(mockSearchService.searchAll).toHaveBeenCalledWith('test', {
        limitPerEntity: 20,
        entities: undefined,
      });
    });

    it('should return results from multiple entity types', async () => {
      mockSearchService.searchAll.mockResolvedValue(mockResults);

      const response = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body.length).toBe(3);
      const types = response.body.map(r => r.type);
      expect(types).toContain('drone');
      expect(types).toContain('user');
      expect(types).toContain('pilot');
    });

    it('should handle special characters in query', async () => {
      mockSearchService.searchAll.mockResolvedValue(mockResults);

      await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'DJI-001' })
        .expect(200);

      expect(mockSearchService.searchAll).toHaveBeenCalledWith('DJI-001', {
        limitPerEntity: 10,
        entities: undefined,
      });
    });

    it('should handle service errors gracefully', async () => {
      mockSearchService.searchAll.mockRejectedValue(new Error('Service error'));

      await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'test' })
        .expect(500);
    });
  });

  describe('GET /api/v1/search/counts', () => {
    const mockCounts = {
      drone: 25,
      user: 10,
      pilot: 5,
      mission: 15,
    };

    it('should return counts for all entity types', async () => {
      mockSearchService.getSearchCounts.mockResolvedValue(mockCounts);

      const response = await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: 'DJI' })
        .expect(200);

      expect(response.body).toEqual(mockCounts);
      expect(response.body.drone).toBe(25);
      expect(response.body.user).toBe(10);
      expect(response.body.pilot).toBe(5);
      expect(response.body.mission).toBe(15);

      expect(mockSearchService.getSearchCounts).toHaveBeenCalledWith('DJI');
    });

    it('should return empty object for empty query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: '' })
        .expect(200);

      expect(response.body).toEqual({});
      expect(mockSearchService.getSearchCounts).not.toHaveBeenCalled();
    });

    it('should return empty object for whitespace-only query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: '   ' })
        .expect(200);

      expect(response.body).toEqual({});
      expect(mockSearchService.getSearchCounts).not.toHaveBeenCalled();
    });

    it('should trim query term before getting counts', async () => {
      mockSearchService.getSearchCounts.mockResolvedValue(mockCounts);

      await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: '  DJI  ' })
        .expect(200);

      expect(mockSearchService.getSearchCounts).toHaveBeenCalledWith('DJI');
    });

    it('should return zero counts when no results found', async () => {
      const zeroCounts = {
        drone: 0,
        user: 0,
        pilot: 0,
        mission: 0,
      };
      mockSearchService.getSearchCounts.mockResolvedValue(zeroCounts);

      const response = await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: 'NonExistentTerm123' })
        .expect(200);

      expect(response.body).toEqual(zeroCounts);
      expect(Object.values(response.body).every(count => count === 0)).toBe(true);
    });

    it('should handle partial counts (some entities have results, some not)', async () => {
      const partialCounts = {
        drone: 10,
        user: 0,
        pilot: 5,
        mission: 0,
      };
      mockSearchService.getSearchCounts.mockResolvedValue(partialCounts);

      const response = await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body).toEqual(partialCounts);
      expect(response.body.drone).toBe(10);
      expect(response.body.user).toBe(0);
    });

    it('should handle special characters in query', async () => {
      mockSearchService.getSearchCounts.mockResolvedValue(mockCounts);

      await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: 'DJI-001' })
        .expect(200);

      expect(mockSearchService.getSearchCounts).toHaveBeenCalledWith('DJI-001');
    });

    it('should handle service errors gracefully', async () => {
      mockSearchService.getSearchCounts.mockRejectedValue(new Error('Service error'));

      await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: 'test' })
        .expect(500);
    });

    it('should handle case-insensitive search term', async () => {
      mockSearchService.getSearchCounts.mockResolvedValue(mockCounts);

      await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: 'dji' })
        .expect(200);

      expect(mockSearchService.getSearchCounts).toHaveBeenCalledWith('dji');
    });
  });

  describe('Integration between search and counts', () => {
    it('should return consistent results between search and counts endpoints', async () => {
      const mockResults: GlobalSearchResult[] = [
        { type: 'drone', id: 1, title: 'Test', data: {} },
        { type: 'drone', id: 2, title: 'Test', data: {} },
        { type: 'user', id: 1, title: 'Test', data: {} },
      ];
      const mockCounts = {
        drone: 2,
        user: 1,
        pilot: 0,
        mission: 0,
      };

      mockSearchService.searchAll.mockResolvedValue(mockResults);
      mockSearchService.getSearchCounts.mockResolvedValue(mockCounts);

      // Search endpoint
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/search')
        .query({ q: 'test' })
        .expect(200);

      // Counts endpoint
      const countsResponse = await request(app.getHttpServer())
        .get('/api/v1/search/counts')
        .query({ q: 'test' })
        .expect(200);

      // Verify consistency (counts should match result counts per type)
      const searchCounts = searchResponse.body.reduce((acc: Record<string, number>, item: GlobalSearchResult) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {});

      expect(searchCounts.drone).toBe(countsResponse.body.drone);
      expect(searchCounts.user).toBe(countsResponse.body.user);
    });
  });
});


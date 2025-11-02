import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService, GlobalSearchResult } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Search')
@Controller('api/v1/search')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) { }

  @Get()
  @ApiOperation({ summary: 'Global search across all entities/tables' })
  @ApiResponse({
    status: 200,
    description: 'Search results from all entities',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'drone' },
          id: { type: 'number', example: 1 },
          title: { type: 'string', example: 'DJI Mavic Pro' },
          subtitle: { type: 'string', example: 'Serial: DJI-001' },
          data: { type: 'object' },
        },
      },
    },
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query term',
    example: 'DJI',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit results per entity type',
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'entities',
    required: false,
    description: 'Comma-separated list of entity types to search (drone,user,pilot,mission)',
    example: 'drone,user',
  })
  async searchAll(
    @Query('q') query: string,
    @Query('limit') limit?: string,
    @Query('entities') entities?: string,
  ): Promise<GlobalSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const limitPerEntity = limit ? parseInt(limit, 10) : 10;
    const entityList = entities ? entities.split(',') : undefined;

    return await this.searchService.searchAll(query.trim(), {
      limitPerEntity,
      entities: entityList,
    });
  }

  @Get('counts')
  @ApiOperation({ summary: 'Get count of search results per entity type' })
  @ApiResponse({
    status: 200,
    description: 'Count of results per entity type',
    schema: {
      type: 'object',
      example: {
        drone: 25,
        user: 10,
        pilot: 5,
        mission: 15,
      },
    },
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query term',
  })
  async getCounts(@Query('q') query: string): Promise<Record<string, number>> {
    if (!query || query.trim().length === 0) {
      return {};
    }

    return await this.searchService.getSearchCounts(query.trim());
  }
}


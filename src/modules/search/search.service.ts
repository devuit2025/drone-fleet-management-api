import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DronesService } from '../drones/drones.service';
import { UsersService } from '../users/users.service';
import { PilotsService } from '../pilots/pilots.service';
import { MissionsService } from '../missions/missions.service';
// Import thêm các services khác

export interface GlobalSearchResult {
  type: string; // 'drone', 'user', 'pilot', etc.
  id: number;
  title: string; // Display name
  subtitle?: string; // Additional info
  data: any; // Full entity data
}

@Injectable()
export class SearchService {
  constructor(
    @Inject(forwardRef(() => DronesService))
    private readonly dronesService: DronesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => PilotsService))
    private readonly pilotsService: PilotsService,
    @Inject(forwardRef(() => MissionsService))
    private readonly missionsService: MissionsService,
    // Inject thêm services khác
  ) { }

  /**
   * Search across all entities/tables in the database
   * @param searchTerm - The search term
   * @param options - Optional filters (limit per entity, etc.)
   */
  async searchAll(
    searchTerm: string,
    options: { limitPerEntity?: number; entities?: string[] } = {},
  ): Promise<GlobalSearchResult[]> {
    const { limitPerEntity = 10, entities } = options;
    const results: GlobalSearchResult[] = [];

    // Parallel search across all entities
    const searchPromises: Promise<GlobalSearchResult[]>[] = [];

    // Search Drones
    if (!entities || entities.includes('drone')) {
      searchPromises.push(this.searchDrones(searchTerm, limitPerEntity));
    }

    // Search Users
    if (!entities || entities.includes('user')) {
      searchPromises.push(this.searchUsers(searchTerm, limitPerEntity));
    }

    // Search Pilots
    if (!entities || entities.includes('pilot')) {
      searchPromises.push(this.searchPilots(searchTerm, limitPerEntity));
    }

    // Search Missions
    if (!entities || entities.includes('mission')) {
      searchPromises.push(this.searchMissions(searchTerm, limitPerEntity));
    }

    // Add more entity searches here...

    // Wait for all searches to complete
    const allResults = await Promise.all(searchPromises);

    // Flatten and return
    return allResults.flat();
  }

  private async searchDrones(term: string, limit: number): Promise<GlobalSearchResult[]> {
    try {
      const result = await this.dronesService.findAll({
        global: term,
        per: limit,
      });
      return result.data.map((drone: any) => ({
        type: 'drone',
        id: drone.id,
        title: drone.name,
        subtitle: `Serial: ${drone.serialNumber} | Status: ${drone.status}`,
        data: drone,
      }));
    } catch (error) {
      console.error('Error searching drones:', error);
      return [];
    }
  }

  private async searchUsers(term: string, limit: number): Promise<GlobalSearchResult[]> {
    try {
      const result = await this.usersService.findAll({
        global: term,
        per: limit,
      });
      return result.data.map((user: any) => ({
        type: 'user',
        id: user.id,
        title: user.name,
        subtitle: user.email,
        data: user,
      }));
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  private async searchPilots(term: string, limit: number): Promise<GlobalSearchResult[]> {
    try {
      const result = await this.pilotsService.findAll({
        global: term,
        per: limit,
      });
      return result.data.map((pilot: any) => ({
        type: 'pilot',
        id: pilot.id,
        title: pilot.name || `Pilot #${pilot.id}`,
        subtitle: pilot.licenseNumber,
        data: pilot,
      }));
    } catch (error) {
      console.error('Error searching pilots:', error);
      return [];
    }
  }

  private async searchMissions(term: string, limit: number): Promise<GlobalSearchResult[]> {
    try {
      const result = await this.missionsService.findAll({
        global: term,
        per: limit,
      });
      return result.data.map((mission: any) => ({
        type: 'mission',
        id: mission.id,
        title: mission.name || `Mission #${mission.id}`,
        subtitle: `Status: ${mission.status}`,
        data: mission,
      }));
    } catch (error) {
      console.error('Error searching missions:', error);
      return [];
    }
  }

  /**
   * Get count of results per entity type
   */
  async getSearchCounts(searchTerm: string): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};

    // Parallel count queries
    const countPromises = [
      this.dronesService
        .findAll({ global: searchTerm, per: 1 })
        .then(result => ({ type: 'drone', total: result.total }))
        .catch(() => ({ type: 'drone', total: 0 })),
      this.usersService
        .findAll({ global: searchTerm, per: 1 })
        .then(result => ({ type: 'user', total: result.total }))
        .catch(() => ({ type: 'user', total: 0 })),
      this.pilotsService
        .findAll({ global: searchTerm, per: 1 })
        .then(result => ({ type: 'pilot', total: result.total }))
        .catch(() => ({ type: 'pilot', total: 0 })),
      this.missionsService
        .findAll({ global: searchTerm, per: 1 })
        .then(result => ({ type: 'mission', total: result.total }))
        .catch(() => ({ type: 'mission', total: 0 })),
    ];

    const results = await Promise.all(countPromises);
    results.forEach(({ type, total }) => {
      counts[type] = total;
    });

    return counts;
  }
}


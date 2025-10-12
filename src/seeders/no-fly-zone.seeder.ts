import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { NoFlyZone, ZoneType } from '../entities/no-fly-zone.entity';

@Injectable()
export class NoFlyZoneSeeder {
  constructor(
    @InjectRepository(NoFlyZone)
    private readonly noFlyZoneRepository: Repository<NoFlyZone>,
  ) { }

  async seed(): Promise<void> {
    console.log('🌱 Seeding No-Fly Zones...');

    // Dynamic import for faker
    const { faker } = await import('@faker-js/faker');

    // Check if no-fly zones already exist
    const existingZones = await this.noFlyZoneRepository.count();
    if (existingZones > 0) {
      console.log('No-fly zones already exist, skipping...');
      return;
    }

    const noFlyZones: Partial<NoFlyZone>[] = [];

    // Predefined no-fly zones (airports, military bases, etc.)
    const predefinedZones = [
      {
        name: 'International Airport Zone',
        zone_type: ZoneType.POLYGON,
        geometry: 'POLYGON((106.6297 10.7769, 106.6400 10.7769, 106.6400 10.7869, 106.6297 10.7869, 106.6297 10.7769))',
        description: 'Airport restricted airspace',
      },
      {
        name: 'Military Base Alpha',
        zone_type: ZoneType.POLYGON,
        geometry: 'POLYGON((106.7000 10.8000, 106.7100 10.8000, 106.7100 10.8100, 106.7000 10.8100, 106.7000 10.8000))',
        description: 'Military restricted area',
      },
      {
        name: 'Government Building Complex',
        zone_type: ZoneType.POLYGON,
        geometry: 'POLYGON((106.7200 10.7800, 106.7300 10.7800, 106.7300 10.7900, 106.7200 10.7900, 106.7200 10.7800))',
        description: 'Government security zone',
      },
    ];

    noFlyZones.push(...predefinedZones);

    // Generate additional random no-fly zones
    for (let i = 0; i < 5; i++) {
      const baseLat = faker.location.latitude();
      const baseLng = faker.location.longitude();

      // Create a small rectangular polygon around the base coordinates
      const offset = 0.001; // Small offset for the polygon
      const polygon = `POLYGON((${baseLng} ${baseLat}, ${baseLng + offset} ${baseLat}, ${baseLng + offset} ${baseLat + offset}, ${baseLng} ${baseLat + offset}, ${baseLng} ${baseLat}))`;

      const reasons = [
        'Wildlife protection area',
        'Private property',
        'Construction site',
        'Event venue',
        'Hospital zone',
        'School zone',
        'Religious site',
        'Historical monument',
      ];

      noFlyZones.push({
        name: `${faker.location.city()} Restricted Zone ${i + 1}`,
        zone_type: ZoneType.POLYGON,
        geometry: polygon,
        description: faker.helpers.arrayElement(reasons),
      });
    }

    await this.noFlyZoneRepository.save(noFlyZones);
    console.log(`✅ Created ${noFlyZones.length} no-fly zones`);
  }
}

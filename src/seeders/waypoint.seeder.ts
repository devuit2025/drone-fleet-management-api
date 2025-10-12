import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { Waypoint } from '../entities/waypoint.entity';
import { Mission, MissionStatus } from '../entities/mission.entity';

@Injectable()
export class WaypointSeeder {
  constructor(
    @InjectRepository(Waypoint)
    private readonly waypointRepository: Repository<Waypoint>,
    @InjectRepository(Mission)
    private readonly missionRepository: Repository<Mission>,
  ) { }

  async seed(): Promise<void> {
    console.log('🌱 Seeding Waypoints...');

    // Dynamic import for faker
    const { faker } = await import('@faker-js/faker');

    // Check if waypoints already exist
    const existingWaypoints = await this.waypointRepository.count();
    if (existingWaypoints > 0) {
      console.log('Waypoints already exist, skipping...');
      return;
    }

    // Get missions that are in progress or completed
    const missions = await this.missionRepository.find({
      where: [
        { status: MissionStatus.IN_PROGRESS },
        { status: MissionStatus.COMPLETED },
      ],
    });

    if (missions.length === 0) {
      console.log('No active missions found, skipping waypoint seeding...');
      return;
    }

    const waypoints: Partial<Waypoint>[] = [];

    const actions = [
      'TAKE_PHOTO',
      'RECORD_VIDEO',
      'SCAN_AREA',
      'DROP_PAYLOAD',
      'HOVER',
      'LAND',
      'TAKEOFF',
      'RETURN_HOME',
    ];

    // Create waypoints for each mission
    for (const mission of missions) {
      const waypointCount = faker.number.int({ min: 3, max: 10 });

      for (let i = 0; i < waypointCount; i++) {
        // Generate coordinates around a central point (simulating a flight path)
        const baseLat = faker.location.latitude();
        const baseLng = faker.location.longitude();

        const lat = baseLat + faker.number.float({ min: -0.01, max: 0.01 });
        const lng = baseLng + faker.number.float({ min: -0.01, max: 0.01 });

        waypoints.push({
          mission_id: mission.id,
          seq_number: i + 1,
          geo_point: `POINT(${lng} ${lat})`, // PostGIS Point format
          altitude_m: faker.number.int({ min: 50, max: 500 }),
          speed_mps: faker.number.float({ min: 5, max: 25, fractionDigits: 1 }),
          action: faker.helpers.arrayElement(actions),
        });
      }
    }

    await this.waypointRepository.save(waypoints);
    console.log(`✅ Created ${waypoints.length} waypoints`);
  }
}

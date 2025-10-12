import { Injectable, Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { PilotSeeder } from './pilot.seeder';
import { LicenseSeeder } from './license.seeder';
import { DroneSeeder } from './drone.seeder';
import { MissionSeeder } from './mission.seeder';
import { WaypointSeeder } from './waypoint.seeder';
import { TelemetrySeeder } from './telemetry.seeder';
import { NoFlyZoneSeeder } from './no-fly-zone.seeder';
import { FlightLogSeeder } from './flight-log.seeder';
import { MissionReportSeeder } from './mission-report.seeder';
import { SimulationSeeder } from './simulation.seeder';

@Injectable()
export class SeederService {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        private readonly userSeeder: UserSeeder,
        private readonly pilotSeeder: PilotSeeder,
        private readonly licenseSeeder: LicenseSeeder,
        private readonly droneSeeder: DroneSeeder,
        private readonly missionSeeder: MissionSeeder,
        private readonly waypointSeeder: WaypointSeeder,
        private readonly telemetrySeeder: TelemetrySeeder,
        private readonly noFlyZoneSeeder: NoFlyZoneSeeder,
        private readonly flightLogSeeder: FlightLogSeeder,
        private readonly missionReportSeeder: MissionReportSeeder,
        private readonly simulationSeeder: SimulationSeeder,
    ) {}

    async seed(): Promise<void> {
        this.logger.log('🌱 Starting database seeding...');
        const startTime = Date.now();

        try {
            // Seed in order to maintain foreign key relationships
            await this.userSeeder.seed();
            await this.pilotSeeder.seed();
            await this.licenseSeeder.seed();
            await this.droneSeeder.seed();
            await this.missionSeeder.seed();
            await this.waypointSeeder.seed();
            await this.telemetrySeeder.seed();
            await this.noFlyZoneSeeder.seed();
            await this.flightLogSeeder.seed();
            await this.missionReportSeeder.seed();
            await this.simulationSeeder.seed();

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;

            this.logger.log(`✅ Database seeding completed successfully in ${duration}s`);
        } catch (error) {
            this.logger.error('❌ Database seeding failed:', error);
            throw error;
        }
    }
}

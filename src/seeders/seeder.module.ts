import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
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
import { SimpleSeeder } from './simple.seeder';
import { NoFakerSeeder } from './no-faker.seeder';

// Import all entities
import { User } from '../entities/user.entity';
import { Pilot } from '../entities/pilot.entity';
import { License } from '../entities/license.entity';
import { Drone } from '../entities/drone.entity';
import { Mission } from '../entities/mission.entity';
import { Waypoint } from '../entities/waypoint.entity';
import { Telemetry } from '../entities/telemetry.entity';
import { NoFlyZone } from '../entities/no-fly-zone.entity';
import { FlightLog } from '../entities/flight-log.entity';
import { MissionReport } from '../entities/mission-report.entity';
import { Simulation } from '../entities/simulation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Pilot,
            License,
            Drone,
            Mission,
            Waypoint,
            Telemetry,
            NoFlyZone,
            FlightLog,
            MissionReport,
            Simulation,
        ]),
    ],
    providers: [
        SeederService,
        UserSeeder,
        PilotSeeder,
        LicenseSeeder,
        DroneSeeder,
        MissionSeeder,
        WaypointSeeder,
        TelemetrySeeder,
        NoFlyZoneSeeder,
        FlightLogSeeder,
        MissionReportSeeder,
        SimulationSeeder,
        SimpleSeeder,
        NoFakerSeeder,
    ],
    exports: [SeederService],
})
export class SeederModule {}

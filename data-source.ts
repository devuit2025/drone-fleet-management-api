import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './src/entities/user.entity';
import { Pilot } from './src/entities/pilot.entity';
import { License } from './src/entities/license.entity';
import { Drone } from './src/entities/drone.entity';
import { DroneConfiguration } from './src/entities/drone-configuration.entity';
import { Mission } from './src/entities/mission.entity';
import { Waypoint } from './src/entities/waypoint.entity';
import { Telemetry } from './src/entities/telemetry.entity';
import { NoFlyZone } from './src/entities/no-fly-zone.entity';
import { FlightLog } from './src/entities/flight-log.entity';
import { MissionReport } from './src/entities/mission-report.entity';
import { Simulation } from './src/entities/simulation.entity';
import { Role } from './src/entities/role.entity';
import { Permission } from './src/entities/permission.entity';
import { DroneBrand } from './src/entities/drone-brand.entity';
import { DroneCategory } from './src/entities/drone-category.entity';
import { DroneModel } from './src/entities/drone-model.entity';
import { DroneSensor } from './src/entities/drone-sensor.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'drone_fleet',
  entities: [
    User, Pilot, License, Drone, DroneConfiguration, Mission, Waypoint,
    Telemetry, NoFlyZone, FlightLog, MissionReport, Simulation, Role,
    Permission, DroneBrand, DroneCategory, DroneModel, DroneSensor,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});


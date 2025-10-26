import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { DronesModule } from './modules/drones/drones.module';
import { MissionsModule } from './modules/missions/missions.module';
import { AuthModule } from './modules/auth/auth.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { PilotsModule } from './modules/pilots/pilots.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { DroneBrandsModule } from './modules/drone-brands/drone-brands.module';
import { DroneGateway } from './gateways/drone.gateway';
import { User } from './entities/user.entity';
import { Pilot } from './entities/pilot.entity';
import { License } from './entities/license.entity';
import { Drone } from './entities/drone.entity';
import { DroneConfiguration } from './entities/drone-configuration.entity';
import { Mission } from './entities/mission.entity';
import { Waypoint } from './entities/waypoint.entity';
import { Telemetry } from './entities/telemetry.entity';
import { NoFlyZone } from './entities/no-fly-zone.entity';
import { FlightLog } from './entities/flight-log.entity';
import { MissionReport } from './entities/mission-report.entity';
import { Simulation } from './entities/simulation.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { DroneBrand } from './entities/drone-brand.entity';
import { SeederModule } from './seeders/seeder.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 5432,
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_DATABASE || 'drone_fleet',
            entities: [
                User,
                Pilot,
                License,
                Drone,
                DroneConfiguration,
                Mission,
                Waypoint,
                Telemetry,
                NoFlyZone,
                FlightLog,
                MissionReport,
                Simulation,
                Role,
                Permission,
                DroneBrand,
            ],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV === 'development',
        }),
        UsersModule,
        DronesModule,
        MissionsModule,
        AuthModule,
        LicensesModule,
        PilotsModule,
        RolesModule,
        PermissionsModule,
        DroneBrandsModule,
        SeederModule,
    ],
    controllers: [AppController],
    providers: [AppService, DroneGateway],
})
export class AppModule { }

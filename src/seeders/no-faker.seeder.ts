import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Pilot, PilotStatus } from '../entities/pilot.entity';
import { License, LicenseType, QualificationLevel } from '../entities/license.entity';
import { Drone, DroneStatus } from '../entities/drone.entity';
import { Mission, MissionStatus } from '../entities/mission.entity';
import { Waypoint } from '../entities/waypoint.entity';
import { Telemetry } from '../entities/telemetry.entity';
import { NoFlyZone, ZoneType } from '../entities/no-fly-zone.entity';
import { FlightLog } from '../entities/flight-log.entity';
import { MissionReport } from '../entities/mission-report.entity';
import { Simulation } from '../entities/simulation.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class NoFakerSeeder {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Pilot)
        private readonly pilotRepository: Repository<Pilot>,
        @InjectRepository(License)
        private readonly licenseRepository: Repository<License>,
        @InjectRepository(Drone)
        private readonly droneRepository: Repository<Drone>,
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
        @InjectRepository(Waypoint)
        private readonly waypointRepository: Repository<Waypoint>,
        @InjectRepository(Telemetry)
        private readonly telemetryRepository: Repository<Telemetry>,
        @InjectRepository(NoFlyZone)
        private readonly noFlyZoneRepository: Repository<NoFlyZone>,
        @InjectRepository(FlightLog)
        private readonly flightLogRepository: Repository<FlightLog>,
        @InjectRepository(MissionReport)
        private readonly missionReportRepository: Repository<MissionReport>,
        @InjectRepository(Simulation)
        private readonly simulationRepository: Repository<Simulation>,
    ) { }

    async seed(): Promise<void> {
        console.log('🌱 Seeding database without faker...');

        // Seed Users
        await this.seedUsers();

        // Seed Pilots
        await this.seedPilots();

        // Seed Licenses
        await this.seedLicenses();

        // Seed Drones
        await this.seedDrones();

        // Seed Missions
        await this.seedMissions();

        // Skip geometry fields for now
        console.log('⚠️ Skipping Waypoints, Telemetry, and No-Fly Zones due to geometry issues');

        // Seed Flight Logs
        await this.seedFlightLogs();

        // Seed Mission Reports
        await this.seedMissionReports();

        // Seed Simulations
        await this.seedSimulations();

        console.log('✅ Database seeding completed successfully!');
    }

    private async seedUsers(): Promise<void> {
        console.log('🌱 Seeding Users...');

        const existingUsers = await this.userRepository.count();
        if (existingUsers > 0) {
            console.log('Users already exist, skipping...');
            return;
        }

        const users: Partial<User>[] = [
            {
                name: 'Admin User',
                email: 'admin@dronefleet.com',
                password: await bcrypt.hash('admin123', 10),
                role: UserRole.ADMIN,
            },
            {
                name: 'Operator One',
                email: 'operator1@dronefleet.com',
                password: await bcrypt.hash('operator123', 10),
                role: UserRole.OPERATOR,
            },
            {
                name: 'Operator Two',
                email: 'operator2@dronefleet.com',
                password: await bcrypt.hash('operator123', 10),
                role: UserRole.OPERATOR,
            },
            {
                name: 'Viewer One',
                email: 'viewer1@dronefleet.com',
                password: await bcrypt.hash('viewer123', 10),
                role: UserRole.VIEWER,
            },
        ];

        await this.userRepository.save(users);
        console.log(`✅ Created ${users.length} users`);
    }

    private async seedPilots(): Promise<void> {
        console.log('🌱 Seeding Pilots...');

        const existingPilots = await this.pilotRepository.count();
        if (existingPilots > 0) {
            console.log('Pilots already exist, skipping...');
            return;
        }

        // Get any users (not just operators) to create pilots
        const users = await this.userRepository.find({ take: 3 });

        if (users.length === 0) {
            console.log('No users found, skipping pilot seeding...');
            return;
        }

        const pilots: Partial<Pilot>[] = users.map(user => ({
            userId: user.id,
            name: user.name,
            status: PilotStatus.ACTIVE,
        }));

        await this.pilotRepository.save(pilots);
        console.log(`✅ Created ${pilots.length} pilots`);
    }

    private async seedLicenses(): Promise<void> {
        console.log('🌱 Seeding Licenses...');

        const existingLicenses = await this.licenseRepository.count();
        if (existingLicenses > 0) {
            console.log('Licenses already exist, skipping...');
            return;
        }

        const pilots = await this.pilotRepository.find();
        if (pilots.length === 0) {
            console.log('No pilots found, skipping license seeding...');
            return;
        }

        const licenses: Partial<License>[] = pilots.map((pilot, index) => ({
            pilotId: pilot.id,
            licenseNumber: `LIC-${String(index + 1).padStart(3, '0')}`,
            licenseType: LicenseType.COMMERCIAL,
            qualificationLevel: QualificationLevel.ADVANCED,
            issuedDate: new Date('2023-01-01'),
            expiryDate: new Date('2025-12-31'),
            issuingAuthority: 'Federal Aviation Administration',
            active: true,
        }));

        await this.licenseRepository.save(licenses);
        console.log(`✅ Created ${licenses.length} licenses`);
    }

    private async seedDrones(): Promise<void> {
        console.log('🌱 Seeding Drones...');

        const existingDrones = await this.droneRepository.count();
        if (existingDrones > 0) {
            console.log('Drones already exist, skipping...');
            return;
        }

        const drones: Partial<Drone>[] = [
            {
                modelId: 1,
                name: 'Phantom 4 Drone',
                serialNumber: 'DRONE-001',
                status: DroneStatus.AVAILABLE,
                firmwareVersion: '1.0.0',
                batteryHealth: 100,
                totalFlightHours: 0,
                lastMaintenance: new Date('2024-01-01'),
            },
            {
                modelId: 1,
                name: 'Mavic Pro Drone',
                serialNumber: 'DRONE-002',
                status: DroneStatus.AVAILABLE,
                firmwareVersion: '1.0.0',
                batteryHealth: 100,
                totalFlightHours: 5,
                lastMaintenance: new Date('2024-01-15'),
            },
            {
                modelId: 1,
                name: 'Inspire 2 Drone',
                serialNumber: 'DRONE-003',
                status: DroneStatus.IN_MISSION,
                firmwareVersion: '1.0.0',
                batteryHealth: 85,
                totalFlightHours: 100,
                lastMaintenance: new Date('2024-02-01'),
            },
        ];

        await this.droneRepository.save(drones);
        console.log(`✅ Created ${drones.length} drones`);
    }

    private async seedMissions(): Promise<void> {
        console.log('🌱 Seeding Missions...');

        const existingMissions = await this.missionRepository.count();
        if (existingMissions > 0) {
            console.log('Missions already exist, skipping...');
            return;
        }

        const pilots = await this.pilotRepository.find();
        const licenses = await this.licenseRepository.find();

        if (pilots.length === 0 || licenses.length === 0) {
            console.log('No pilots or licenses found, skipping mission seeding...');
            return;
        }

        const missions: Partial<Mission>[] = [
            {
                pilotId: pilots[0].id,
                licenseId: licenses[0].id,
                missionName: 'Surveillance Mission 1',
                status: MissionStatus.COMPLETED,
                startTime: new Date('2024-01-01T08:00:00'),
                endTime: new Date('2024-01-01T10:00:00'),
            },
            {
                pilotId: pilots[1]?.id || pilots[0].id,
                licenseId: licenses[1]?.id || licenses[0].id,
                missionName: 'Delivery Mission 1',
                status: MissionStatus.IN_PROGRESS,
                startTime: new Date('2024-01-02T09:00:00'),
                endTime: null,
            },
            {
                pilotId: pilots[0].id,
                licenseId: licenses[0].id,
                missionName: 'Mapping Mission 1',
                status: MissionStatus.PLANNED,
                startTime: new Date('2024-01-03T10:00:00'),
                endTime: null,
            },
        ];

        await this.missionRepository.save(missions);
        console.log(`✅ Created ${missions.length} missions`);
    }

    private async seedWaypoints(): Promise<void> {
        console.log('🌱 Seeding Waypoints...');

        const existingWaypoints = await this.waypointRepository.count();
        if (existingWaypoints > 0) {
            console.log('Waypoints already exist, skipping...');
            return;
        }

        const missions = await this.missionRepository.find();
        if (missions.length === 0) {
            console.log('No missions found, skipping waypoint seeding...');
            return;
        }

        const waypoints: Partial<Waypoint>[] = [];

        missions.forEach((mission, missionIndex) => {
            for (let i = 0; i < 3; i++) {
                waypoints.push({
                    missionId: mission.id,
                    seqNumber: i + 1,
                    geoPoint: JSON.stringify({
                        type: 'Point',
                        coordinates: [106.6 + i * 0.01, 10.7 + i * 0.01],
                    }),
                    altitudeM: 100 + i * 50,
                    speedMps: 10 + i * 5,
                    action: i === 0 ? 'takeoff' : i === 2 ? 'landing' : 'waypoint',
                });
            }
        });

        await this.waypointRepository.save(waypoints);
        console.log(`✅ Created ${waypoints.length} waypoints`);
    }

    private async seedTelemetry(): Promise<void> {
        console.log('🌱 Seeding Telemetry...');

        const existingTelemetry = await this.telemetryRepository.count();
        if (existingTelemetry > 0) {
            console.log('Telemetry already exist, skipping...');
            return;
        }

        const drones = await this.droneRepository.find();
        const missions = await this.missionRepository.find();

        if (drones.length === 0) {
            console.log('No drones found, skipping telemetry seeding...');
            return;
        }

        const telemetryData: Partial<Telemetry>[] = [];

        drones.forEach((drone, droneIndex) => {
            for (let i = 0; i < 10; i++) {
                const lat = 10.7 + i * 0.001;
                const lng = 106.6 + i * 0.001;
                const timestamp = new Date(Date.now() - i * 60000); // 1 minute intervals

                telemetryData.push({
                    droneId: drone.id,
                    missionId: missions[i % missions.length]?.id || null,
                    timestamp,
                    location: JSON.stringify({
                        type: 'Point',
                        coordinates: [lng, lat],
                    }),
                    altitudeM: 100 + i * 10,
                    speedMps: 10 + i * 2,
                    batteryPct: 100 - i * 5,
                    status: 'flying',
                    payloadWeight: 200 + i * 50,
                });
            }
        });

        await this.telemetryRepository.save(telemetryData);
        console.log(`✅ Created ${telemetryData.length} telemetry entries`);
    }

    private async seedNoFlyZones(): Promise<void> {
        console.log('🌱 Seeding No-Fly Zones...');

        const existingNoFlyZones = await this.noFlyZoneRepository.count();
        if (existingNoFlyZones > 0) {
            console.log('No-Fly Zones already exist, skipping...');
            return;
        }

        const noFlyZones: Partial<NoFlyZone>[] = [
            {
                name: 'International Airport Zone',
                zoneType: ZoneType.POLYGON,
                geometry: JSON.stringify({
                    type: 'Polygon',
                    coordinates: [
                        [
                            [106.6297, 10.7769],
                            [106.64, 10.7769],
                            [106.64, 10.7869],
                            [106.6297, 10.7869],
                            [106.6297, 10.7769],
                        ],
                    ],
                }),
                description: 'Airport restricted airspace',
            },
            {
                name: 'Military Base Alpha',
                zoneType: ZoneType.POLYGON,
                geometry: JSON.stringify({
                    type: 'Polygon',
                    coordinates: [
                        [
                            [106.7, 10.8],
                            [106.71, 10.8],
                            [106.71, 10.81],
                            [106.7, 10.81],
                            [106.7, 10.8],
                        ],
                    ],
                }),
                description: 'Military restricted area',
            },
        ];

        await this.noFlyZoneRepository.save(noFlyZones);
        console.log(`✅ Created ${noFlyZones.length} no-fly zones`);
    }

    private async seedFlightLogs(): Promise<void> {
        console.log('🌱 Seeding Flight Logs...');

        const existingFlightLogs = await this.flightLogRepository.count();
        if (existingFlightLogs > 0) {
            console.log('Flight Logs already exist, skipping...');
            return;
        }

        const missions = await this.missionRepository.find({
            where: [{ status: MissionStatus.IN_PROGRESS }, { status: MissionStatus.COMPLETED }],
        });

        if (missions.length === 0) {
            console.log(
                'No in-progress or completed missions found, skipping flight log seeding...',
            );
            return;
        }

        const flightLogs: Partial<FlightLog>[] = [];

        missions.forEach(mission => {
            for (let i = 0; i < 5; i++) {
                flightLogs.push({
                    missionId: mission.id,
                    timestamp: new Date(Date.now() - i * 300000), // 5 minute intervals
                    eventType: i === 0 ? 'info' : i === 4 ? 'info' : 'debug',
                    description:
                        i === 0
                            ? 'Mission started successfully'
                            : i === 4
                                ? 'Mission completed successfully'
                                : `Waypoint ${i} reached`,
                });
            }
        });

        await this.flightLogRepository.save(flightLogs);
        console.log(`✅ Created ${flightLogs.length} flight logs`);
    }

    private async seedMissionReports(): Promise<void> {
        console.log('🌱 Seeding Mission Reports...');

        const existingMissionReports = await this.missionReportRepository.count();
        if (existingMissionReports > 0) {
            console.log('Mission Reports already exist, skipping...');
            return;
        }

        const missions = await this.missionRepository.find({
            where: { status: MissionStatus.COMPLETED },
        });

        if (missions.length === 0) {
            console.log('No completed missions found, skipping mission report seeding...');
            return;
        }

        const missionReports: Partial<MissionReport>[] = missions.map(mission => ({
            missionId: mission.id,
            flightTimeSec: 3600, // 1 hour
            distanceM: 10000,
            avgSpeedMps: 15.5,
            batteryConsumedPct: 45.2,
            incidentCount: 0,
        }));

        await this.missionReportRepository.save(missionReports);
        console.log(`✅ Created ${missionReports.length} mission reports`);
    }

    private async seedSimulations(): Promise<void> {
        console.log('🌱 Seeding Simulations...');

        const existingSimulations = await this.simulationRepository.count();
        if (existingSimulations > 0) {
            console.log('Simulations already exist, skipping...');
            return;
        }

        const missions = await this.missionRepository.find();
        const pilots = await this.pilotRepository.find();

        if (missions.length === 0 || pilots.length === 0) {
            console.log('No missions or pilots found, skipping simulation seeding...');
            return;
        }

        const simulations: Partial<Simulation>[] = missions.map((mission, index) => ({
            pilotId: pilots[index % pilots.length].id,
            missionId: mission.id,
            simStartTime: new Date(Date.now() - 86400000), // 1 day ago
            simEndTime: new Date(Date.now() - 3600000), // 1 hour ago
            parameters: {
                simulation_type: 'Weather Impact Analysis',
                weather_conditions: 'Clear',
                wind_speed: 10,
                temperature: 25,
                humidity: 60,
                mission_duration: 60,
            },
        }));

        await this.simulationRepository.save(simulations);
        console.log(`✅ Created ${simulations.length} simulations`);
    }
}

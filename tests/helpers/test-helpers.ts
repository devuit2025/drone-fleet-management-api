import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UserRole } from '../../src/entities/user.entity';
import { DroneStatus } from '../../src/entities/drone.entity';
import { MissionStatus } from '../../src/entities/mission.entity';
import { PilotStatus } from '../../src/entities/pilot.entity';
import { LicenseType, QualificationLevel } from '../../src/entities/license.entity';

export interface TestUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface TestPilot {
  id: number;
  user_id: number;
  name: string;
  status: PilotStatus;
}

export interface TestLicense {
  id: number;
  pilot_id: number;
  license_number: string;
  license_type: LicenseType;
  qualification_level: QualificationLevel;
  issuing_authority: string;
  issued_date: string;
  expiry_date: string;
  active: boolean;
}

export interface TestDrone {
  id: number;
  name: string;
  model: string;
  serialNumber: string;
  maxPayload: number;
  batteryCapacity: number;
  lastMaintenance: string;
  status: DroneStatus;
}

export interface TestMission {
  id: number;
  mission_name: string;
  pilot_id: number;
  license_id: number;
  status: MissionStatus;
  start_time?: string;
  end_time?: string;
}

export class TestDataFactory {
  constructor(private app: INestApplication) { }

  async createTestUser(userData?: Partial<TestUser>): Promise<TestUser> {
    const defaultUserData = {
      name: 'Test User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'test123',
      role: UserRole.OPERATOR,
      ...userData,
    };

    const response = await request(this.app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(defaultUserData)
      .expect(201);

    return {
      id: response.body.user.id,
      name: response.body.user.name,
      email: response.body.user.email,
      role: response.body.user.role,
      token: response.body.token,
    };
  }

  async createTestPilot(userId: number, pilotData?: Partial<TestPilot>): Promise<TestPilot> {
    const defaultPilotData = {
      user_id: userId,
      name: 'Test Pilot',
      status: PilotStatus.ACTIVE,
      ...pilotData,
    };

    const response = await request(this.app.getHttpServer())
      .post('/api/v1/pilots')
      .set('Authorization', `Bearer ${this.getAuthToken()}`)
      .send(defaultPilotData)
      .expect(201);

    return {
      id: response.body.id,
      user_id: response.body.user_id,
      name: response.body.name,
      status: response.body.status,
    };
  }

  async createTestLicense(pilotId: number, licenseData?: Partial<TestLicense>): Promise<TestLicense> {
    const defaultLicenseData = {
      pilot_id: pilotId,
      license_number: `LIC-TEST-${Date.now()}`,
      license_type: LicenseType.COMMERCIAL,
      qualification_level: QualificationLevel.ADVANCED,
      issuing_authority: 'FAA',
      issued_date: '2025-01-01',
      expiry_date: '2026-01-01',
      active: true,
      ...licenseData,
    };

    const response = await request(this.app.getHttpServer())
      .post('/api/v1/licenses')
      .set('Authorization', `Bearer ${this.getAuthToken()}`)
      .send(defaultLicenseData)
      .expect(201);

    return {
      id: response.body.id,
      pilot_id: response.body.pilot_id,
      license_number: response.body.license_number,
      license_type: response.body.license_type,
      qualification_level: response.body.qualification_level,
      issuing_authority: response.body.issuing_authority,
      issued_date: response.body.issued_date,
      expiry_date: response.body.expiry_date,
      active: response.body.active,
    };
  }

  async createTestDrone(droneData?: Partial<TestDrone>): Promise<TestDrone> {
    const defaultDroneData = {
      name: 'Test Drone',
      model: 'DJI Phantom 4',
      serialNumber: `TEST-DJI-${Date.now()}`,
      maxPayload: 1.0,
      batteryCapacity: 100,
      lastMaintenance: '2025-01-01',
      ...droneData,
    };

    const response = await request(this.app.getHttpServer())
      .post('/api/v1/drones')
      .set('Authorization', `Bearer ${this.getAuthToken()}`)
      .send(defaultDroneData)
      .expect(201);

    return {
      id: response.body.id,
      name: response.body.name,
      model: response.body.model,
      serialNumber: response.body.serial_number,
      maxPayload: response.body.max_payload,
      batteryCapacity: response.body.battery_capacity,
      lastMaintenance: response.body.last_maintenance,
      status: response.body.status || DroneStatus.AVAILABLE,
    };
  }

  async createTestMission(
    pilotId: number,
    droneId: number,
    missionData?: Partial<TestMission>
  ): Promise<TestMission> {
    const defaultMissionData = {
      name: 'Test Mission',
      description: 'Test mission description',
      plannedStartTime: new Date(Date.now() + 60000).toISOString(),
      plannedDuration: 60,
      startLatitude: 10.7,
      startLongitude: 106.6,
      startAltitude: 100,
      pilotId: pilotId.toString(),
      droneId: droneId.toString(),
      weatherConditions: 'Clear',
      notes: 'Test mission notes',
      ...missionData,
    };

    const response = await request(this.app.getHttpServer())
      .post('/api/v1/flights')
      .set('Authorization', `Bearer ${this.getAuthToken()}`)
      .send(defaultMissionData)
      .expect(201);

    return {
      id: response.body.id,
      mission_name: response.body.mission_name,
      pilot_id: response.body.pilot_id,
      license_id: response.body.license_id,
      status: response.body.status,
      start_time: response.body.start_time,
      end_time: response.body.end_time,
    };
  }

  async startMission(missionId: number, startData?: any): Promise<void> {
    const defaultStartData = {
      startLatitude: 10.7,
      startLongitude: 106.6,
      startAltitude: 100,
      ...startData,
    };

    await request(this.app.getHttpServer())
      .patch(`/api/v1/flights/${missionId}/start`)
      .set('Authorization', `Bearer ${this.getAuthToken()}`)
      .send(defaultStartData)
      .expect(200);
  }

  async endMission(missionId: number, endData?: any): Promise<void> {
    const defaultEndData = {
      endLatitude: 10.8,
      endLongitude: 106.7,
      endAltitude: 100,
      ...endData,
    };

    await request(this.app.getHttpServer())
      .patch(`/api/v1/flights/${missionId}/end`)
      .set('Authorization', `Bearer ${this.getAuthToken()}`)
      .send(defaultEndData)
      .expect(200);
  }

  async updateDroneStatus(droneId: number, status: DroneStatus): Promise<void> {
    await request(this.app.getHttpServer())
      .patch(`/api/v1/drones/${droneId}/status`)
      .set('Authorization', `Bearer ${this.getAuthToken()}`)
      .send({ status })
      .expect(200);
  }

  // Method to set auth token for the factory
  setAuthToken(token: string): void {
    (this as any).authToken = token;
  }

  // Method to get auth token from factory
  getAuthToken(): string {
    return (this as any).authToken || 'test-token';
  }
}

// Utility functions for common test operations
export async function createCompleteTestScenario(app: INestApplication) {
  const factory = new TestDataFactory(app);

  // Create user and get token
  const user = await factory.createTestUser();
  factory.setAuthToken(user.token);

  // Create pilot
  const pilot = await factory.createTestPilot(user.id);

  // Create license
  const license = await factory.createTestLicense(pilot.id);

  // Create drone
  const drone = await factory.createTestDrone();

  // Create mission
  const mission = await factory.createTestMission(pilot.id, drone.id);

  return {
    user,
    pilot,
    license,
    drone,
    mission,
    factory,
  };
}

export async function cleanupTestData(app: INestApplication, testData: any) {
  // Clean up test data if needed
  // This is a placeholder - implement based on your cleanup needs
  console.log('Cleaning up test data...');
}

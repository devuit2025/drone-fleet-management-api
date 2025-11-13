/**
 * REAL Integration Flow Test - Tests actual API calls with database
 * 
 * ⚠️  WARNING: This test requires:
 * 1. Database running (PostgreSQL with PostGIS)
 * 2. Schema initialized (run migrations or enable synchronize)
 * 3. All tables created
 * 
 * This test calls REAL API endpoints and interacts with REAL database
 * It will CREATE actual data in the database!
 * 
 * To run this test:
 * 1. Start database: docker compose up -d postgres
 * 2. Ensure synchronize is enabled OR run migrations
 * 3. Run: npm test -- src/real-flow.spec.ts
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from './app.module';
import { ExecutionContext } from '@nestjs/common';

// Mock JWT Guard for integration tests
class TestJwtAuthGuard {
    canActivate(context: ExecutionContext): boolean {
        return true;
    }
}

describe('REAL Complete Drone Fleet Management Flow', () => {
    let app: INestApplication;

    beforeAll(async () => {
        console.log('\n🔧 Setting up test environment...');

        // Increase test timeout
        jest.setTimeout(60000);

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useClass(TestJwtAuthGuard)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

        try {
            await app.init();
            console.log('✅ Application initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize application:', error.message);
            throw error;
        }
    });

    afterAll(async () => {
        if (app) {
            await app.close();
            // Wait for connections to close
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        console.log('✅ Application closed');
    });

    it('should execute REAL complete workflow: Create User → Drone → Mission → Execute', async () => {
        // Increase timeout for this test
        jest.setTimeout(90000);
        console.log('\n🚀 Starting REAL integration test with database...');
        console.log('⚠️  NOTE: This test requires database with schema!');
        console.log('📝 This test will create REAL data in the database with prefix "test_integrate_"\n');

        // Track created IDs for cleanup
        const createdIds: Record<string, any> = {};
        const prefix = `test_integrate_${Date.now()}`;

        try {
            // ===== STEP 1: Create User (REAL API CALL) =====
            console.log('📝 Step 1: Creating user via POST /api/v1/users...');
            const userResponse = await request(app.getHttpServer())
                .post('/api/v1/users')
                .send({
                    name: `${prefix}_Operator`,
                    email: `${prefix}_operator@example.com`,
                    password: 'Test123!',
                    role: 'operator'
                });

            if (userResponse.status !== 201) {
                console.error('User creation failed:', userResponse.body);
            }

            expect(userResponse.status).toBe(201);

            expect(userResponse.body).toHaveProperty('id');
            createdIds.userId = userResponse.body.id;
            console.log(`✅ User created: ID=${createdIds.userId}, Email=${userResponse.body.email}`);

            // ===== STEP 2: Create Pilot (REAL API CALL) =====
            console.log('\n📝 Step 2: Creating pilot via POST /api/v1/pilots...');
            const pilotResponse = await request(app.getHttpServer())
                .post('/api/v1/pilots')
                .send({
                    userId: createdIds.userId,
                    name: `${prefix}_Pilot`,
                    status: 'active'
                })
                .expect(201);

            expect(pilotResponse.body).toHaveProperty('id');
            createdIds.pilotId = pilotResponse.body.id;
            console.log(`✅ Pilot created: ID=${createdIds.pilotId}, Name=${pilotResponse.body.name}`);

            // ===== STEP 3: Create License (REAL API CALL) =====
            console.log('\n📝 Step 3: Creating license via POST /api/v1/licenses...');
            const licenseResponse = await request(app.getHttpServer())
                .post('/api/v1/licenses')
                .send({
                    pilotId: createdIds.pilotId,
                    licenseNumber: `${prefix}_LIC`,
                    licenseType: 'commercial',
                    qualificationLevel: 'basic',
                    issuingAuthority: 'FAA',
                    issuedDate: '2024-01-01',
                    expiryDate: '2025-01-01',
                    active: true
                })
                .expect(201);

            expect(licenseResponse.body).toHaveProperty('id');
            createdIds.licenseId = licenseResponse.body.id;
            console.log(`✅ License created: ID=${createdIds.licenseId}, Number=${licenseResponse.body.licenseNumber}`);

            // ===== STEP 4: Create Drone Brand (REAL API CALL) =====
            console.log('\n📝 Step 4: Creating drone brand via POST /api/v1/drone-brands...');

            const brandResponse = await request(app.getHttpServer())
                .post('/api/v1/drone-brands')
                .send({
                    name: `${prefix}_Brand`,
                    country: 'USA'
                });

            if (brandResponse.status !== 201) {
                console.error('❌ Brand creation failed!');
                console.error('Status:', brandResponse.status);
                console.error('Response:', JSON.stringify(brandResponse.body, null, 2));
            } else {
                console.log('✅ Brand creation successful');
            }

            expect(brandResponse.status).toBe(201);

            expect(brandResponse.body).toHaveProperty('id');
            createdIds.brandId = brandResponse.body.id;
            console.log(`✅ Drone brand created: ID=${createdIds.brandId}, Name=${brandResponse.body.name}`);

            // ===== STEP 5: Create Drone Category (REAL API CALL) =====
            console.log('\n📝 Step 5: Creating drone category via POST /api/v1/drone-categories...');
            const categoryResponse = await request(app.getHttpServer())
                .post('/api/v1/drone-categories')
                .send({
                    name: `${prefix}_Category`,
                    description: 'Integration test category'
                })
                .expect(201);

            expect(categoryResponse.body).toHaveProperty('id');
            createdIds.categoryId = categoryResponse.body.id;
            console.log(`✅ Drone category created: ID=${createdIds.categoryId}, Name=${categoryResponse.body.name}`);

            // ===== STEP 6: Create Drone Model (REAL API CALL) =====
            console.log('\n📝 Step 6: Creating drone model via POST /api/v1/drone-models...');
            const modelResponse = await request(app.getHttpServer())
                .post('/api/v1/drone-models')
                .send({
                    brandId: createdIds.brandId,
                    categoryId: createdIds.categoryId,
                    name: `${prefix}_Model`,
                    maxAltitude: 200,
                    maxSpeed: 20,
                    batteryCapacity: 10000
                })
                .expect(201);

            expect(modelResponse.body).toHaveProperty('id');
            createdIds.modelId = modelResponse.body.id;
            console.log(`✅ Drone model created: ID=${createdIds.modelId}, Name=${modelResponse.body.name}`);

            // ===== STEP 7: Create Drone (REAL API CALL) =====
            console.log('\n📝 Step 7: Creating drone via POST /api/v1/drones...');
            const droneResponse = await request(app.getHttpServer())
                .post('/api/v1/drones')
                .send({
                    modelId: createdIds.modelId,
                    name: `${prefix}_Drone`,
                    serialNumber: `${prefix}_SERIAL`,
                    status: 'available'
                })
                .expect(201);

            expect(droneResponse.body).toHaveProperty('id');
            createdIds.droneId = droneResponse.body.id;
            console.log(`✅ Drone created: ID=${createdIds.droneId}, Serial=${droneResponse.body.serialNumber}`);

            // ===== STEP 8: Create Mission (REAL API CALL) =====
            console.log('\n📝 Step 8: Creating mission via POST /api/v1/missions...');
            const missionResponse = await request(app.getHttpServer())
                .post('/api/v1/missions')
                .send({
                    pilotId: createdIds.pilotId,
                    licenseId: createdIds.licenseId,
                    missionName: `${prefix}_Mission`,
                    status: 'planned', // Use lowercase
                    drones: [
                        {
                            droneId: createdIds.droneId,
                        },
                    ],
                })
                .expect(201);

            if (missionResponse.status !== 201) {
                console.error('Mission creation failed:', missionResponse.body);
            }

            expect(missionResponse.body).toHaveProperty('id');
            createdIds.missionId = missionResponse.body.id;
            if (Array.isArray(missionResponse.body.missionDrones) && missionResponse.body.missionDrones.length > 0) {
                createdIds.missionDroneId = missionResponse.body.missionDrones[0].id;
            }
            console.log(`✅ Mission created: ID=${createdIds.missionId}, Name=${missionResponse.body.missionName}`);

            // ===== STEP 9: Create Waypoints for Mission (REAL API CALLS) =====
            console.log('\n📝 Step 9: Creating waypoints for mission...');

            if (!createdIds.missionDroneId) {
                throw new Error('Mission drone ID not found after mission creation');
            }

            // Waypoint 1: Take off
            const waypoint1Response = await request(app.getHttpServer())
                .post('/api/v1/waypoints')
                .send({
                    missionDroneId: createdIds.missionDroneId,
                    seqNumber: 1,
                    geoPoint: 'POINT(106.6296 10.8231)',
                    altitudeM: 10,
                    speedMps: 10,
                    action: 'take_off'
                })
                .expect(201);

            createdIds.waypointIds = [waypoint1Response.body.id];
            console.log(`✅ Waypoint 1 created: ID=${waypoint1Response.body.id}`);

            // Waypoint 2: Fly to
            const waypoint2Response = await request(app.getHttpServer())
                .post('/api/v1/waypoints')
                .send({
                    missionDroneId: createdIds.missionDroneId,
                    seqNumber: 2,
                    geoPoint: 'POINT(106.6306 10.8241)',
                    altitudeM: 50,
                    speedMps: 15,
                    action: 'fly_to'
                })
                .expect(201);

            createdIds.waypointIds.push(waypoint2Response.body.id);
            console.log(`✅ Waypoint 2 created: ID=${waypoint2Response.body.id}`);

            // Waypoint 3: Land
            const waypoint3Response = await request(app.getHttpServer())
                .post('/api/v1/waypoints')
                .send({
                    missionDroneId: createdIds.missionDroneId,
                    seqNumber: 3,
                    geoPoint: 'POINT(106.6316 10.8251)',
                    altitudeM: 10,
                    speedMps: 10,
                    action: 'land'
                })
                .expect(201);

            createdIds.waypointIds.push(waypoint3Response.body.id);
            console.log(`✅ Waypoint 3 created: ID=${waypoint3Response.body.id}`);
            console.log(`✅ Total ${createdIds.waypointIds.length} waypoints created`);

            // ===== STEP 10: Assign Drone to Mission (via ManyToMany) =====
            console.log('\n📝 Step 10: Getting mission to assign drone...');
            const getMissionResponse = await request(app.getHttpServer())
                .get(`/api/v1/missions/${createdIds.missionId}`)
                .expect(200);
            if (!createdIds.missionDroneId && Array.isArray(getMissionResponse.body.missionDrones)) {
                createdIds.missionDroneId = getMissionResponse.body.missionDrones[0]?.id;
            }
            console.log('✅ Mission retrieved for drone assignment');

            // ===== STEP 11: Start Mission =====
            console.log('\n📝 Step 11: Starting mission (status: in_progress)...');
            const startMissionResponse = await request(app.getHttpServer())
                .patch(`/api/v1/missions/${createdIds.missionId}`)
                .send({
                    status: 'in_progress',
                    startTime: new Date().toISOString()
                })
                .expect(200);

            expect(startMissionResponse.body.status).toBe('in_progress');
            console.log(`✅ Mission started: Status=${startMissionResponse.body.status}`);

            // ===== STEP 12: Update Drone Status to "in_mission" =====
            console.log('\n📝 Step 12: Updating drone status to in_mission...');
            const droneStatusResponse = await request(app.getHttpServer())
                .patch(`/api/v1/drones/${createdIds.droneId}`)
                .send({ status: 'in_mission' })
                .expect(200);

            console.log(`✅ Drone status: ${droneStatusResponse.body.status}`);

            // ===== STEP 13: Simulate Drone Flight - Record Telemetry =====
            console.log('\n📝 Step 13: Simulating drone flight - recording telemetry...');

            // Telemetry at waypoint 1
            const telemetry1Response = await request(app.getHttpServer())
                .post('/api/v1/telemetry')
                .send({
                    droneId: createdIds.droneId,
                    missionId: createdIds.missionId,
                    timestamp: new Date().toISOString(),
                    altitudeM: 15,
                    speedMps: 12,
                    batteryPct: 100,
                    status: 'flying',
                    location: 'POINT(106.6297 10.8232)',
                    payloadWeight: 0
                });

            if (telemetry1Response.status !== 201) {
                console.error('Telemetry creation failed:', telemetry1Response.body);
            }
            expect(telemetry1Response.status).toBe(201);

            createdIds.telemetryIds = [telemetry1Response.body.id];
            console.log(`✅ Telemetry 1 recorded: ID=${telemetry1Response.body.id}`);

            // Telemetry at waypoint 2
            const telemetry2Response = await request(app.getHttpServer())
                .post('/api/v1/telemetry')
                .send({
                    droneId: createdIds.droneId,
                    missionId: createdIds.missionId,
                    timestamp: new Date().toISOString(),
                    altitudeM: 55,
                    speedMps: 14,
                    batteryPct: 95,
                    status: 'flying',
                    location: 'POINT(106.6305 10.8240)',
                    payloadWeight: 0
                });

            if (telemetry2Response.status !== 201) {
                console.error('Telemetry 2 creation failed:', telemetry2Response.body);
            }
            expect(telemetry2Response.status).toBe(201);

            createdIds.telemetryIds.push(telemetry2Response.body.id);
            console.log(`✅ Telemetry 2 recorded: ID=${telemetry2Response.body.id}`);

            // Telemetry at waypoint 3
            const telemetry3Response = await request(app.getHttpServer())
                .post('/api/v1/telemetry')
                .send({
                    droneId: createdIds.droneId,
                    missionId: createdIds.missionId,
                    timestamp: new Date().toISOString(),
                    altitudeM: 15,
                    speedMps: 10,
                    batteryPct: 90,
                    status: 'landing',
                    location: 'POINT(106.6315 10.8250)',
                    payloadWeight: 0
                });

            if (telemetry3Response.status !== 201) {
                console.error('Telemetry 3 creation failed:', telemetry3Response.body);
            }
            expect(telemetry3Response.status).toBe(201);

            createdIds.telemetryIds.push(telemetry3Response.body.id);
            console.log(`✅ Telemetry 3 recorded: ID=${telemetry3Response.body.id}`);
            console.log(`✅ Total ${createdIds.telemetryIds.length} telemetry records`);

            // ===== STEP 14: Record Flight Logs =====
            console.log('\n📝 Step 14: Recording flight logs...');

            const log1Response = await request(app.getHttpServer())
                .post('/api/v1/flight-logs')
                .send({
                    missionId: createdIds.missionId,
                    eventType: 'info',
                    description: 'Mission started - Drone taking off',
                    timestamp: new Date().toISOString()
                });

            if (log1Response.status !== 201) {
                console.error('Flight log 1 creation failed:', log1Response.body);
            }
            expect(log1Response.status).toBe(201);

            createdIds.flightLogIds = [log1Response.body.id];
            console.log(`✅ Flight log 1 created: ID=${log1Response.body.id}`);

            const log2Response = await request(app.getHttpServer())
                .post('/api/v1/flight-logs')
                .send({
                    missionId: createdIds.missionId,
                    eventType: 'info',
                    description: 'Waypoint 1 reached - cruising altitude achieved',
                    timestamp: new Date().toISOString()
                })
                .expect(201);

            createdIds.flightLogIds.push(log2Response.body.id);
            console.log(`✅ Flight log 2 created: ID=${log2Response.body.id}`);

            const log3Response = await request(app.getHttpServer())
                .post('/api/v1/flight-logs')
                .send({
                    missionId: createdIds.missionId,
                    eventType: 'info',
                    description: 'Waypoint 2 reached - route point achieved',
                    timestamp: new Date().toISOString()
                })
                .expect(201);

            createdIds.flightLogIds.push(log3Response.body.id);
            console.log(`✅ Flight log 3 created: ID=${log3Response.body.id}`);

            const log4Response = await request(app.getHttpServer())
                .post('/api/v1/flight-logs')
                .send({
                    missionId: createdIds.missionId,
                    eventType: 'success',
                    description: 'Mission completed - Drone landed safely',
                    timestamp: new Date().toISOString()
                })
                .expect(201);

            createdIds.flightLogIds.push(log4Response.body.id);
            console.log(`✅ ${createdIds.flightLogIds.length} flight logs recorded`);

            // ===== STEP 15: Complete Mission =====
            console.log('\n📝 Step 15: Completing mission (status: completed)...');
            const completeResponse = await request(app.getHttpServer())
                .patch(`/api/v1/missions/${createdIds.missionId}`)
                .send({
                    status: 'completed',
                    endTime: new Date().toISOString()
                })
                .expect(200);

            expect(completeResponse.body.status).toBe('completed');
            console.log(`✅ Mission completed: Status=${completeResponse.body.status}`);

            // ===== STEP 16: Create Mission Report =====
            console.log('\n📝 Step 16: Creating mission report...');
            const reportResponse = await request(app.getHttpServer())
                .post('/api/v1/mission-reports')
                .send({
                    missionId: createdIds.missionId,
                    flightTimeSec: 1800,
                    distanceM: 3000,
                    avgSpeedMps: 12.5,
                    batteryConsumedPct: 10,
                    incidentCount: 0
                })
                .expect(201);

            createdIds.reportId = reportResponse.body.id;
            console.log(`✅ Mission report created: ID=${createdIds.reportId}`);

            // ===== STEP 17: Release Drone (Update Status to Available) =====
            console.log('\n📝 Step 17: Releasing drone (status: available)...');
            const releaseResponse = await request(app.getHttpServer())
                .patch(`/api/v1/drones/${createdIds.droneId}`)
                .send({ status: 'available' })
                .expect(200);

            expect(releaseResponse.body.status).toBe('available');
            console.log(`✅ Drone released: Status=${releaseResponse.body.status}`);

            // ===== STEP 18: Verify Mission Completion =====
            console.log('\n📝 Step 18: Verifying mission completion...');
            const verifyResponse = await request(app.getHttpServer())
                .get(`/api/v1/missions/${createdIds.missionId}`)
                .expect(200);

            expect(verifyResponse.body.status).toBe('completed');
            expect(verifyResponse.body.startTime).toBeDefined();
            expect(verifyResponse.body.endTime).toBeDefined();
            console.log(`✅ Mission verified: Status=${verifyResponse.body.status}`);
            console.log(`✅ Start time: ${verifyResponse.body.startTime}`);
            console.log(`✅ End time: ${verifyResponse.body.endTime}`);

            // ===== TEST COMPLETE: SUCCESS =====
            console.log('\n✅ REAL Integration Test Completed Successfully!');
            console.log('\n📊 Created Resources Summary:');
            console.log(`  - Users: ${createdIds.userId}`);
            console.log(`  - Pilots: ${createdIds.pilotId}`);
            console.log(`  - Licenses: ${createdIds.licenseId}`);
            console.log(`  - Drone Brands: ${createdIds.brandId}`);
            console.log(`  - Drone Categories: ${createdIds.categoryId}`);
            console.log(`  - Drone Models: ${createdIds.modelId}`);
            console.log(`  - Drones: ${createdIds.droneId}`);
            console.log(`  - Missions: ${createdIds.missionId}`);
            console.log(`  - Waypoints: ${createdIds.waypointIds.length}`);
            console.log(`  - Telemetry: ${createdIds.telemetryIds.length}`);
            console.log(`  - Flight Logs: ${createdIds.flightLogIds.length}`);
            console.log(`  - Mission Reports: 1`);

            // ===== CLEANUP: Delete created test data =====
            console.log('\n🧹 Cleaning up test data...');
            try {
                // Delete in reverse order to maintain referential integrity
                if (createdIds.reportId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/mission-reports/${createdIds.reportId}`)
                        .expect(200);
                    console.log('✅ Deleted mission report');
                }
                if (createdIds.flightLogIds && Array.isArray(createdIds.flightLogIds)) {
                    for (const logId of createdIds.flightLogIds) {
                        await request(app.getHttpServer())
                            .delete(`/api/v1/flight-logs/${logId}`)
                            .expect(200);
                    }
                    console.log(`✅ Deleted ${createdIds.flightLogIds.length} flight logs`);
                }
                if (createdIds.telemetryIds && Array.isArray(createdIds.telemetryIds)) {
                    for (const telemId of createdIds.telemetryIds) {
                        await request(app.getHttpServer())
                            .delete(`/api/v1/telemetry/${telemId}`)
                            .expect(200);
                    }
                    console.log(`✅ Deleted ${createdIds.telemetryIds.length} telemetry records`);
                }
                if (createdIds.waypointIds && Array.isArray(createdIds.waypointIds)) {
                    for (const waypointId of createdIds.waypointIds) {
                        await request(app.getHttpServer())
                            .delete(`/api/v1/waypoints/${waypointId}`)
                            .expect(200);
                    }
                    console.log(`✅ Deleted ${createdIds.waypointIds.length} waypoints`);
                }
                if (createdIds.missionId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/missions/${createdIds.missionId}`)
                        .expect(200);
                    console.log('✅ Deleted mission');
                }
                if (createdIds.droneId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/drones/${createdIds.droneId}`)
                        .expect(200);
                    console.log('✅ Deleted drone');
                }
                if (createdIds.modelId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/drone-models/${createdIds.modelId}`)
                        .expect(200);
                }
                if (createdIds.categoryId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/drone-categories/${createdIds.categoryId}`)
                        .expect(200);
                }
                if (createdIds.brandId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/drone-brands/${createdIds.brandId}`)
                        .expect(200);
                }
                if (createdIds.licenseId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/licenses/${createdIds.licenseId}`)
                        .expect(200);
                }
                if (createdIds.pilotId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/pilots/${createdIds.pilotId}`)
                        .expect(200);
                }
                if (createdIds.userId) {
                    await request(app.getHttpServer())
                        .delete(`/api/v1/users/${createdIds.userId}`)
                        .expect(200);
                }
                console.log('✅ Test data cleaned up');
            } catch (cleanupError) {
                console.log('⚠️ Some cleanup operations failed:', cleanupError.message);
            }

            // Test completed successfully
        } catch (error) {
            console.error('\n❌ Test failed with error:', error);
            throw error;
        }
    });
});

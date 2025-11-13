import { ApiProperty } from '@nestjs/swagger';
import { Mission, MissionStatus } from '../../../entities/mission.entity';
import { Pilot } from '../../../entities/pilot.entity';
import { MissionDrone } from '../../../entities/mission-drone.entity';
import { Waypoint } from '../../../entities/waypoint.entity';
import { Drone } from '../../../entities/drone.entity';
import { Telemetry } from '../../../entities/telemetry.entity';
import { FlightLog } from '../../../entities/flight-log.entity';
import { MissionReport } from '../../../entities/mission-report.entity';
import { Simulation } from '../../../entities/simulation.entity';
import { formatPointGeometry } from '../../../utils/geometry';

export class MissionResponseDto {
    @ApiProperty({ description: 'Mission ID' })
    id: number;

    @ApiProperty({ description: 'Pilot ID' })
    pilotId: number;

    @ApiProperty({ description: 'License ID' })
    licenseId: number;

    @ApiProperty({ description: 'Mission name' })
    missionName: string;

    @ApiProperty({ description: 'Mission status', enum: MissionStatus })
    status: MissionStatus;

    @ApiProperty({ description: 'Start time' })
    startTime: Date;

    @ApiProperty({ description: 'End time' })
    endTime: Date;

    @ApiProperty({ description: 'Creation date' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date' })
    updatedAt: Date;

    @ApiProperty({ description: 'Pilot information', type: Object, required: false })
    pilot?: Pilot;

    @ApiProperty({ description: 'Mission drones with their waypoints', type: [Object], required: false })
    missionDrones?: Array<{
        id: number;
        missionId: number;
        droneId: number;
        assignedAt: Date;
        drone?: any;
        waypoints: Array<{
            id: number;
            missionDroneId: number;
            seqNumber: number;
            geoPoint: any;
            altitudeM: number;
            speedMps: number;
            action: string;
            createdAt: Date;
        }>;
    }>;

    @ApiProperty({ description: 'Telemetry data', type: [Object], required: false })
    telemetry?: Telemetry[];

    @ApiProperty({ description: 'Flight logs', type: [Object], required: false })
    flightLogs?: FlightLog[];

    @ApiProperty({ description: 'Mission reports', type: [Object], required: false })
    reports?: MissionReport[];

    @ApiProperty({ description: 'Simulations', type: [Object], required: false })
    simulations?: Simulation[];

    constructor(mission: Mission) {
        this.id = mission.id;
        this.pilotId = mission.pilotId;
        this.licenseId = mission.licenseId;
        this.missionName = mission.missionName;
        this.status = mission.status;
        this.startTime = mission.startTime;
        this.endTime = mission.endTime;
        this.createdAt = mission.createdAt;
        this.updatedAt = mission.updatedAt;

        // Include relations if they exist
        if ((mission as any).pilot) {
            this.pilot = (mission as any).pilot;
        }
        if ((mission as any).missionDrones) {
            this.missionDrones = ((mission as any).missionDrones as MissionDrone[]).map(missionDrone => ({
                id: missionDrone.id,
                missionId: missionDrone.missionId,
                droneId: missionDrone.droneId,
                assignedAt: missionDrone.assignedAt,
                drone: missionDrone.drone ? this.serializeDrone(missionDrone.drone) : undefined,
                waypoints: Array.isArray(missionDrone.waypoints)
                    ? missionDrone.waypoints.map(waypoint => this.serializeWaypoint(waypoint))
                    : [],
            }));
        }
        if ((mission as any).telemetry) {
            this.telemetry = (mission as any).telemetry;
        }
        if ((mission as any).flightLogs) {
            this.flightLogs = (mission as any).flightLogs;
        }
        if ((mission as any).reports) {
            this.reports = (mission as any).reports;
        }
        if ((mission as any).simulations) {
            this.simulations = (mission as any).simulations;
        }
    }
    private serializeDrone(drone: Drone): any {
        const { missionDrones, ...rest } = drone as any;
        return rest;
    }

    private serializeWaypoint(waypoint: Waypoint): {
        id: number;
        missionDroneId: number;
        seqNumber: number;
        geoPoint: any;
        altitudeM: number;
        speedMps: number;
        action: string;
        createdAt: Date;
    } {
        return {
            id: waypoint.id,
            missionDroneId: waypoint.missionDroneId,
            seqNumber: waypoint.seqNumber,
            geoPoint: formatPointGeometry(waypoint.geoPoint),
            altitudeM: waypoint.altitudeM,
            speedMps: waypoint.speedMps,
            action: waypoint.action,
            createdAt: waypoint.createdAt,
        };
    }
}

import { ApiProperty } from '@nestjs/swagger';
import { Mission, MissionStatus } from '../../../entities/mission.entity';
import { Pilot } from '../../../entities/pilot.entity';
import { Drone } from '../../../entities/drone.entity';
import { Waypoint } from '../../../entities/waypoint.entity';
import { Telemetry } from '../../../entities/telemetry.entity';
import { FlightLog } from '../../../entities/flight-log.entity';
import { MissionReport } from '../../../entities/mission-report.entity';
import { Simulation } from '../../../entities/simulation.entity';

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

    @ApiProperty({ description: 'Drone information', type: Object, required: false })
    drone?: Drone;

    @ApiProperty({ description: 'Waypoints', type: [Object], required: false })
    waypoints?: Waypoint[];

    @ApiProperty({ description: 'Drones assigned to mission', type: [Object], required: false })
    drones?: Drone[];

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
        if ((mission as any).drone) {
            this.drone = (mission as any).drone;
        }
        if ((mission as any).waypoints) {
            this.waypoints = (mission as any).waypoints;
        }
        if ((mission as any).drones) {
            this.drones = (mission as any).drones;
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
}

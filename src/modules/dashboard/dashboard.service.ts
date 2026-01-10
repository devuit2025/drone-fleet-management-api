import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Drone, DroneStatus } from '../../entities/drone.entity';
import { Mission, MissionStatus } from '../../entities/mission.entity';
import { Pilot, PilotStatus } from '../../entities/pilot.entity';
import { License } from '../../entities/license.entity';
import { FlightPermit, PermitStatus } from '../../entities/flight-permit.entity';
import { NoFlyZone } from '../../entities/no-fly-zone.entity';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Drone)
        private droneRepository: Repository<Drone>,
        @InjectRepository(Mission)
        private missionRepository: Repository<Mission>,
        @InjectRepository(Pilot)
        private pilotRepository: Repository<Pilot>,
        @InjectRepository(License)
        private licenseRepository: Repository<License>,
        @InjectRepository(FlightPermit)
        private flightPermitRepository: Repository<FlightPermit>,
        @InjectRepository(NoFlyZone)
        private noFlyZoneRepository: Repository<NoFlyZone>,
    ) {}

    async getStats() {
        const [droneStats, missionStats, pilotStats, licenseStats, permitStats, noFlyZoneCount] =
            await Promise.all([
                this.getDroneStats(),
                this.getMissionStats(),
                this.getPilotStats(),
                this.getLicenseStats(),
                this.getFlightPermitStats(),
                this.noFlyZoneRepository.count(),
            ]);

        return {
            drones: droneStats,
            missions: missionStats,
            pilots: pilotStats,
            licenses: licenseStats,
            permits: permitStats,
            noFlyZones: noFlyZoneCount,
        };
    }

    private async getDroneStats() {
        const total = await this.droneRepository.count();

        // Count by status
        const byStatus = await this.droneRepository
            .createQueryBuilder('drone')
            .select('drone.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('drone.status')
            .getRawMany();

        const statusMap: Record<string, number> = {};
        byStatus.forEach((item) => {
            statusMap[item.status] = parseInt(item.count);
        });

        // Calculate average battery health
        const batteryResult = await this.droneRepository
            .createQueryBuilder('drone')
            .select('AVG(drone.battery_health)', 'avg')
            .where('drone.battery_health IS NOT NULL')
            .getRawOne();

        // Calculate total flight hours
        const flightHoursResult = await this.droneRepository
            .createQueryBuilder('drone')
            .select('SUM(drone.total_flight_hours)', 'total')
            .getRawOne();

        return {
            total,
            available: statusMap[DroneStatus.AVAILABLE] || 0,
            in_flight: statusMap[DroneStatus.FLYING] || 0,
            maintenance: statusMap[DroneStatus.MAINTENANCE] || 0,
            charging: 0, // Not in enum - always 0
            decommissioned: statusMap[DroneStatus.DECOMMISSIONED] || 0,
            avgBatteryHealth: batteryResult?.avg ? parseFloat(batteryResult.avg).toFixed(1) : 0,
            totalFlightHours: flightHoursResult?.total
                ? parseFloat(flightHoursResult.total).toFixed(1)
                : 0,
        };
    }

    private async getMissionStats() {
        const total = await this.missionRepository.count();

        // Count by status
        const byStatus = await this.missionRepository
            .createQueryBuilder('mission')
            .select('mission.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('mission.status')
            .getRawMany();

        const statusMap: Record<string, number> = {};
        byStatus.forEach((item) => {
            statusMap[item.status] = parseInt(item.count);
        });

        // Count today's missions
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCount = await this.missionRepository
            .createQueryBuilder('mission')
            .where('mission.created_at >= :today', { today })
            .getCount();

        // Calculate success rate
        const completed = statusMap[MissionStatus.COMPLETED] || 0;
        const failed = statusMap[MissionStatus.FAILED] || 0;
        const successRate =
            completed + failed > 0 ? ((completed / (completed + failed)) * 100).toFixed(1) : 0;

        return {
            total,
            planned: statusMap[MissionStatus.PLANNED] || 0,
            in_progress: statusMap[MissionStatus.IN_PROGRESS] || 0,
            completed: statusMap[MissionStatus.COMPLETED] || 0,
            cancelled: 0, // Not in enum - always 0
            failed: statusMap[MissionStatus.FAILED] || 0,
            today: todayCount,
            successRate: parseFloat(successRate as string),
        };
    }

    private async getPilotStats() {
        const total = await this.pilotRepository.count();

        // Count by status
        const byStatus = await this.pilotRepository
            .createQueryBuilder('pilot')
            .select('pilot.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('pilot.status')
            .getRawMany();

        const statusMap: Record<string, number> = {};
        byStatus.forEach((item) => {
            statusMap[item.status] = parseInt(item.count);
        });

        return {
            total,
            active: statusMap[PilotStatus.ACTIVE] || 0,
            inactive: statusMap[PilotStatus.INACTIVE] || 0,
        };
    }

    private async getLicenseStats() {
        const total = await this.licenseRepository.count();

        const now = new Date();

        // Count active licenses (active = true AND not expired)
        const active = await this.licenseRepository
            .createQueryBuilder('license')
            .where('license.active = :active', { active: true })
            .andWhere('license.expiry_date > :now', { now })
            .getCount();

        // Count expired licenses
        const expired = await this.licenseRepository
            .createQueryBuilder('license')
            .where('license.expiry_date <= :now', { now })
            .getCount();

        // Count expiring soon (within 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const expiringSoon = await this.licenseRepository
            .createQueryBuilder('license')
            .where('license.active = :active', { active: true })
            .andWhere('license.expiry_date > :now', { now })
            .andWhere('license.expiry_date <= :thirtyDays', { thirtyDays: thirtyDaysFromNow })
            .getCount();

        return {
            total,
            active,
            expired,
            expiringSoon,
        };
    }

    private async getFlightPermitStats() {
        const total = await this.flightPermitRepository.count();

        // Count by status
        const byStatus = await this.flightPermitRepository
            .createQueryBuilder('permit')
            .select('permit.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('permit.status')
            .getRawMany();

        const statusMap: Record<string, number> = {};
        byStatus.forEach((item) => {
            statusMap[item.status] = parseInt(item.count);
        });

        const now = new Date();

        // Count active permits (approved and not expired)
        const active = await this.flightPermitRepository
            .createQueryBuilder('permit')
            .where('permit.status = :status', { status: PermitStatus.APPROVED })
            .andWhere('(permit.expiry_date IS NULL OR permit.expiry_date > :now)', { now })
            .getCount();

        // Count expiring soon (within 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const expiringSoon = await this.flightPermitRepository
            .createQueryBuilder('permit')
            .where('permit.status = :status', { status: PermitStatus.APPROVED })
            .andWhere('permit.expiry_date IS NOT NULL')
            .andWhere('permit.expiry_date > :now', { now })
            .andWhere('permit.expiry_date <= :sevenDays', { sevenDays: sevenDaysFromNow })
            .getCount();

        return {
            total,
            pending: statusMap[PermitStatus.PENDING] || 0,
            approved: statusMap[PermitStatus.APPROVED] || 0,
            rejected: statusMap[PermitStatus.REJECTED] || 0,
            active,
            expiringSoon,
        };
    }
}


import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { License } from '../../entities/license.entity';
import { FlightPermit, PermitStatus } from '../../entities/flight-permit.entity';
import { CreateLicenseWithPermitDto } from './dto/license-with-permit.dto';
import { GeometryParseError, normalizeGeometryObject } from '../../utils/geometry';

@Injectable()
export class LicensesService {
  constructor(
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
    @InjectRepository(FlightPermit)
    private readonly flightPermitRepository: Repository<FlightPermit>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Create License and FlightPermit in a single transaction
   */
  async createLicenseWithPermit(dto: CreateLicenseWithPermitDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Normalize geometry first (before starting transaction)
      let geometryValue: any;
      try {
        geometryValue = normalizeGeometryObject(dto.flightPermit.airspaceArea);
      } catch (error) {
        if (error instanceof GeometryParseError) {
          throw new BadRequestException(error.message);
        }
        throw error;
      }

      // 1. Create License
      const license = this.licenseRepository.create({
        pilotId: dto.license.pilotId,
        licenseNumber: dto.license.licenseNumber,
        licenseType: dto.license.licenseType,
        qualificationLevel: dto.license.qualificationLevel,
        issuingAuthority: dto.license.issuingAuthority,
        issuedDate: new Date(dto.license.issuedDate),
        expiryDate: new Date(dto.license.expiryDate),
        active: dto.license.active !== undefined ? dto.license.active : true,
      });
      const savedLicense = await queryRunner.manager.save(license);

      // 2. Create FlightPermit with the new License ID
      const flightPermit = this.flightPermitRepository.create({
        licenseId: savedLicense.id,
        permitNumber: dto.flightPermit.permitNumber,
        status: dto.flightPermit.status || PermitStatus.PENDING,
        airspaceArea: geometryValue,
        description: dto.flightPermit.description,
        applicantName: dto.flightPermit.applicantName,
        applicantAddress: dto.flightPermit.applicantAddress,
        applicantNationality: dto.flightPermit.applicantNationality,
        applicantPhone: dto.flightPermit.applicantPhone,
        flightPurpose: dto.flightPermit.flightPurpose,
        issuedDate: dto.flightPermit.issuedDate ? new Date(dto.flightPermit.issuedDate) : undefined,
        expiryDate: dto.flightPermit.expiryDate ? new Date(dto.flightPermit.expiryDate) : undefined,
        takeoffLandingLocation: dto.flightPermit.takeoffLandingLocation,
        attachments: dto.flightPermit.attachments,
      });
      const savedFlightPermit = await queryRunner.manager.save(flightPermit);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Return both with relations
      const licenseWithRelations = await this.licenseRepository.findOne({
        where: { id: savedLicense.id },
        relations: ['pilot', 'flightPermits'],
      });

      return {
        license: licenseWithRelations,
        flightPermit: savedFlightPermit,
      };
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}


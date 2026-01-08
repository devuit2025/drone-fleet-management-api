import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlightPermit } from '../../entities/flight-permit.entity';
import { CreateFlightPermitDto, UpdateFlightPermitDto } from './dto';
import { FlightPermitRepository } from '../../repositories/flight-permit.repository';
import { BaseService } from '../../common/base.service';
import { GeometryParseError, normalizeGeometryObject } from '../../utils/geometry';

@Injectable()
export class FlightPermitsService extends BaseService<FlightPermit> {
  constructor(
    @InjectRepository(FlightPermit)
    private readonly flightPermitRepository: Repository<FlightPermit>,
    private readonly flightPermitRepo: FlightPermitRepository,
  ) {
    super(flightPermitRepo, 'Flight permit');
  }

  async create(createFlightPermitDto: CreateFlightPermitDto): Promise<FlightPermit> {
    const geometryValue = this.normalizeGeometryOrThrow(createFlightPermitDto.airspaceArea);
    const permit = this.flightPermitRepository.create({
      licenseId: createFlightPermitDto.licenseId,
      permitNumber: createFlightPermitDto.permitNumber,
      status: createFlightPermitDto.status || 'pending' as any,
      airspaceArea: geometryValue,
      description: createFlightPermitDto.description,
      applicantName: createFlightPermitDto.applicantName,
      applicantAddress: createFlightPermitDto.applicantAddress,
      applicantNationality: createFlightPermitDto.applicantNationality,
      applicantPhone: createFlightPermitDto.applicantPhone,
      flightPurpose: createFlightPermitDto.flightPurpose,
      issuedDate: createFlightPermitDto.issuedDate
        ? new Date(createFlightPermitDto.issuedDate)
        : undefined,
      expiryDate: createFlightPermitDto.expiryDate
        ? new Date(createFlightPermitDto.expiryDate)
        : undefined,
      takeoffLandingLocation: createFlightPermitDto.takeoffLandingLocation,
      attachments: createFlightPermitDto.attachments,
    });
    return await this.flightPermitRepository.save(permit);
  }

  async update(id: number, data: UpdateFlightPermitDto | Partial<FlightPermit>): Promise<FlightPermit> {
    const updateFlightPermitDto = data as UpdateFlightPermitDto;
    const permit = await this.findById(id);

    if (updateFlightPermitDto.licenseId !== undefined) {
      permit.licenseId = updateFlightPermitDto.licenseId;
    }
    if (updateFlightPermitDto.permitNumber !== undefined) {
      permit.permitNumber = updateFlightPermitDto.permitNumber;
    }
    if (updateFlightPermitDto.status !== undefined) {
      permit.status = updateFlightPermitDto.status as any;
    }
    if (updateFlightPermitDto.airspaceArea !== undefined) {
      permit.airspaceArea = this.normalizeGeometryOrThrow(updateFlightPermitDto.airspaceArea);
    }
    if (updateFlightPermitDto.description !== undefined) {
      permit.description = updateFlightPermitDto.description;
    }
    if (updateFlightPermitDto.applicantName !== undefined) {
      permit.applicantName = updateFlightPermitDto.applicantName;
    }
    if (updateFlightPermitDto.applicantAddress !== undefined) {
      permit.applicantAddress = updateFlightPermitDto.applicantAddress;
    }
    if (updateFlightPermitDto.applicantNationality !== undefined) {
      permit.applicantNationality = updateFlightPermitDto.applicantNationality;
    }
    if (updateFlightPermitDto.applicantPhone !== undefined) {
      permit.applicantPhone = updateFlightPermitDto.applicantPhone;
    }
    if (updateFlightPermitDto.flightPurpose !== undefined) {
      permit.flightPurpose = updateFlightPermitDto.flightPurpose;
    }
    if (updateFlightPermitDto.issuedDate !== undefined) {
      permit.issuedDate = new Date(updateFlightPermitDto.issuedDate);
    }
    if (updateFlightPermitDto.expiryDate !== undefined) {
      permit.expiryDate = new Date(updateFlightPermitDto.expiryDate);
    }
    if (updateFlightPermitDto.takeoffLandingLocation !== undefined) {
      permit.takeoffLandingLocation = updateFlightPermitDto.takeoffLandingLocation;
    }
    if (updateFlightPermitDto.attachments !== undefined) {
      permit.attachments = updateFlightPermitDto.attachments;
    }

    return await this.flightPermitRepository.save(permit);
  }

  private normalizeGeometryOrThrow(input: any): any {
    try {
      return normalizeGeometryObject(input);
    } catch (error) {
      if (error instanceof GeometryParseError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}


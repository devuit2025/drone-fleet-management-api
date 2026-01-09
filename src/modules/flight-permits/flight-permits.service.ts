import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FlightPermit } from '../../entities/flight-permit.entity';
import { CreateFlightPermitDto, UpdateFlightPermitDto } from './dto';
import { FlightPermitRepository } from '../../repositories/flight-permit.repository';
import { BaseService } from '../../common/base.service';
import { GeometryParseError, normalizeGeometryObject } from '../../utils/geometry';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

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

  async generatePDF(id: number): Promise<Buffer> {
    // Load permit with relations
    const permit = await this.flightPermitRepository.findOne({
      where: { id },
      relations: ['license', 'license.pilot'],
    });

    if (!permit) {
      throw new NotFoundException(`Flight permit with ID ${id} not found`);
    }

    // Load HTML template
    const templatePath = path.join(process.cwd(), 'templates', 'flight-permit.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // Prepare data for template
    const currentDate = new Date();
    const issuedDate = permit.issuedDate ? new Date(permit.issuedDate) : null;
    const expiryDate = permit.expiryDate ? new Date(permit.expiryDate) : null;

    // Format dates
    const formatDate = (date: Date | null) => {
      if (!date) return '';
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const flightDates = issuedDate && expiryDate
      ? `From ${formatDate(issuedDate)} to ${formatDate(expiryDate)}`
      : '';

    // Parse geometry for description
    let airspaceAreaDescription = 'See attached map';
    try {
      const geom = typeof permit.airspaceArea === 'string'
        ? JSON.parse(permit.airspaceArea)
        : permit.airspaceArea;

      if (geom && geom.coordinates && geom.coordinates[0]) {
        const coords = geom.coordinates[0];
        airspaceAreaDescription = `Polygon with ${coords.length} points`;
      }
    } catch (e) {
      // Use default description
    }

    // Replace placeholders
    const replacements = {
      '{{applicantName}}': permit.applicantName || '',
      '{{applicantAddress}}': permit.applicantAddress || '',
      '{{applicantNationality}}': permit.applicantNationality || '',
      '{{applicantPhone}}': permit.applicantPhone || '',
      '{{flightPurpose}}': permit.flightPurpose || '',
      '{{droneModel}}': 'UAV (Unmanned Aerial Vehicle)',
      '{{airspaceAreaDescription}}': airspaceAreaDescription,
      '{{flightDates}}': flightDates,
      '{{takeoffLandingLocation}}': permit.takeoffLandingLocation || '',
      '{{flightChart}}': 'See attached map',
      '{{currentDay}}': currentDate.getDate().toString(),
      '{{currentMonth}}': (currentDate.getMonth() + 1).toString(),
      '{{currentYear}}': currentDate.getFullYear().toString(),
    };

    // Replace all placeholders
    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(key, 'g'), value);
    }

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  async getExportData(id: number) {
    const permit = await this.flightPermitRepository.findOne({
      where: { id },
      relations: ['license', 'license.pilot', 'missions', 'missions.missionDrones'],
    });

    if (!permit) {
      throw new NotFoundException(`Flight permit with ID ${id} not found`);
    }

    // Get drones from missions
    const droneIds = new Set<number>();
    permit.missions?.forEach(mission => {
      mission.missionDrones?.forEach(md => {
        if (md.droneId) droneIds.add(md.droneId);
      });
    });

    // Load drones if needed
    let drones = [];
    if (droneIds.size > 0) {
      drones = await this.flightPermitRepository.manager
        .getRepository('Drone')
        .createQueryBuilder('drone')
        .where('drone.id IN (:...ids)', { ids: Array.from(droneIds) })
        .getMany();
    }

    return {
      permit: {
        ...permit,
        airspaceArea: typeof permit.airspaceArea === 'string'
          ? permit.airspaceArea
          : JSON.stringify(permit.airspaceArea),
      },
      license: permit.license,
      pilot: permit.license?.pilot,
      missions: permit.missions,
      drones,
    };
  }
}


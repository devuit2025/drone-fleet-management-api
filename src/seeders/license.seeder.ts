import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { License, LicenseType, QualificationLevel } from '../entities/license.entity';
import { Pilot } from '../entities/pilot.entity';

@Injectable()
export class LicenseSeeder {
    constructor(
        @InjectRepository(License)
        private readonly licenseRepository: Repository<License>,
        @InjectRepository(Pilot)
        private readonly pilotRepository: Repository<Pilot>,
    ) {}

    async seed(): Promise<void> {
        console.log('🌱 Seeding Licenses...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if licenses already exist
        const existingLicenses = await this.licenseRepository.count();
        if (existingLicenses > 0) {
            console.log('Licenses already exist, skipping...');
            return;
        }

        // Get all pilots
        const pilots = await this.pilotRepository.find();
        if (pilots.length === 0) {
            console.log('No pilots found, skipping license seeding...');
            return;
        }

        const licenses: Partial<License>[] = [];

        // Create licenses for pilots
        for (const pilot of pilots) {
            const issueDate = faker.date.past({ years: 5 });
            const expiryDate = faker.date.future({ years: 2, refDate: issueDate });

            licenses.push({
                pilotId: pilot.id,
                licenseNumber: `LIC-${faker.string.alphanumeric(8).toUpperCase()}`,
                licenseType: faker.helpers.arrayElement(Object.values(LicenseType)),
                qualificationLevel: faker.helpers.arrayElement(Object.values(QualificationLevel)),
                issuedDate: issueDate,
                expiryDate: expiryDate,
                issuingAuthority: faker.helpers.arrayElement([
                    'Federal Aviation Administration',
                    'Civil Aviation Authority',
                    'European Aviation Safety Agency',
                    'Transport Canada',
                    'Civil Aviation Safety Authority',
                ]),
                active: faker.datatype.boolean(),
            });
        }

        await this.licenseRepository.save(licenses);
        console.log(`✅ Created ${licenses.length} licenses`);
    }
}

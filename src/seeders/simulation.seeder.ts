import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { Simulation } from '../entities/simulation.entity';
import { Mission } from '../entities/mission.entity';
import { Pilot } from '../entities/pilot.entity';

@Injectable()
export class SimulationSeeder {
    constructor(
        @InjectRepository(Simulation)
        private readonly simulationRepository: Repository<Simulation>,
        @InjectRepository(Mission)
        private readonly missionRepository: Repository<Mission>,
        @InjectRepository(Pilot)
        private readonly pilotRepository: Repository<Pilot>,
    ) { }

    async seed(): Promise<void> {
        console.log('🌱 Seeding Simulations...');

        // Dynamic import for faker
        const { faker } = await import('@faker-js/faker');

        // Check if simulations already exist
        const existingSimulations = await this.simulationRepository.count();
        if (existingSimulations > 0) {
            console.log('Simulations already exist, skipping...');
            return;
        }

        // Get missions and pilots
        const missions = await this.missionRepository.find();
        const pilots = await this.pilotRepository.find();

        if (missions.length === 0 || pilots.length === 0) {
            console.log('No missions or pilots found, skipping simulation seeding...');
            return;
        }

        const simulations: Partial<Simulation>[] = [];

        const simulationTypes = [
            'Weather Impact Analysis',
            'Battery Life Prediction',
            'Flight Path Optimization',
            'Wind Resistance Test',
            'Payload Capacity Test',
            'Emergency Landing Simulation',
            'Communication Range Test',
            'Collision Avoidance Test',
        ];

        // Generate simulations for missions
        for (const mission of missions) {
            const simulationCount = faker.number.int({ min: 1, max: 3 });

            for (let i = 0; i < simulationCount; i++) {
                const simulationType = faker.helpers.arrayElement(simulationTypes);
                const pilot = faker.helpers.arrayElement(pilots);

                const startTime = faker.date.recent({ days: 30 });
                const endTime = faker.date.between({ from: startTime, to: new Date() });

                const parameters = {
                    simulation_type: simulationType,
                    weather_conditions: faker.helpers.arrayElement([
                        'Clear',
                        'Cloudy',
                        'Windy',
                        'Rainy',
                    ]),
                    wind_speed: faker.number.int({ min: 0, max: 30 }),
                    temperature: faker.number.int({ min: -10, max: 40 }),
                    humidity: faker.number.int({ min: 30, max: 90 }),
                    mission_duration: faker.number.int({ min: 30, max: 180 }),
                };

                simulations.push({
                    pilotId: pilot.id,
                    missionId: mission.id,
                    simStartTime: startTime,
                    simEndTime: endTime,
                    parameters,
                });
            }
        }

        await this.simulationRepository.save(simulations);
        console.log(`✅ Created ${simulations.length} simulations`);
    }
}

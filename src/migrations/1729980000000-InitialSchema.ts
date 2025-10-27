import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1729980000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // This migration creates the initial schema
    // The schema is already defined in entities
    // TypeORM synchronize will handle the creation
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables
    await queryRunner.query(`DROP TABLE IF EXISTS "mission_drones" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "mission_reports" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "flight_logs" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "no_fly_zones" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "telemetry" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "simulations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "waypoints" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "missions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drone_sensors" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drone_configurations" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drones" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drone_models" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drone_categories" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drone_brands" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "licenses" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pilots" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."no_fly_zones_zone_type_enum";`);
  }
}


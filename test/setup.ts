import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export let app: INestApplication;
export let httpServer: any;

export async function createTestApp(moduleClass: any): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [moduleClass],
  }).compile();

  app = moduleRef.createNestApplication();
  await app.init();
  httpServer = app.getHttpServer();
  return app;
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
  }
}

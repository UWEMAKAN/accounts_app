import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  const knex = {};

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: getConnectionToken(),
          useValue: knex,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

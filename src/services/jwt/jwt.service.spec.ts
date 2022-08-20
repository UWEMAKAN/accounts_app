import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { JWTService } from './jwt.service';

type Key = 'JWT_SECRET' | 'JWT_EXPIRATION';

describe(JWTService.name, () => {
  let module: TestingModule;
  let service: JWTService;

  const configService = {
    get: jest.fn((key: Key) => {
      if (key === 'JWT_SECRET') {
        return 'test_nonce';
      }
      if (key === 'JWT_EXPIRATION') {
        return '24h';
      }
      return '';
    }),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        JWTService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
    service = module.get<JWTService>(JWTService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${JWTService.name} should be defined`, () => {
    expect(service).toBeDefined();
  });

  describe(`${JWTService.name}.getToken`, () => {
    test('should generate and return a new jwt', () => {
      const payload = { id: 1, email: 'bender.rodriguez@futura.ma' };

      const token = service.getToken(payload);
      expect.assertions(4);
      expect(typeof token).toBe('string');
      expect(configService.get).toBeCalledTimes(2);
      expect(configService.get).toHaveBeenNthCalledWith(1, 'JWT_SECRET');
      expect(configService.get).toHaveBeenNthCalledWith(2, 'JWT_EXPIRATION');
    });
  });

  describe(`${JWTService.name}.verifyToken`, () => {
    test('should verify a valid jwt', () => {
      const payload = { id: 1, email: 'bender.rodriguez@futura.ma' };
      const token = service.getToken(payload);

      service.verifyToken(token, payload);
      expect.assertions(1);
      expect(typeof token).toBe('string');
    });

    test('should throw an error with message Invalid Token', async () => {
      const payload = { id: 1, email: 'bender.rodriguez@futura.ma' };
      const token = jwt.sign(
        { exp: Math.floor(Date.now() / 1000) - 60 * 60, data: payload },
        'secret',
      );

      try {
        await service.verifyToken(token, payload);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED),
        );
      }
    });

    test('should throw an error with message Expired Token', async () => {
      const payload = { id: 1, email: 'bender.rodriguez@futura.ma' };
      const token = service.getToken({ id: 1, email: 'philip.fry@futura.ma' });

      try {
        await service.verifyToken(token, payload);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException('Invalid User', HttpStatus.UNAUTHORIZED),
        );
      }
    });
  });
});

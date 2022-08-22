import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import { JWTService } from '../../../services';
import { AuthGuard } from './auth.guard';

describe(AuthGuard.name, () => {
  let module: TestingModule;
  let guard: AuthGuard;
  let jwtService: JWTService;

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'test_nonce';
      }
      if (key === 'JWT_EXPIRATION') {
        return '24h';
      }
      return '';
    }),
  };
  const connection = {
    select: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AuthGuard,
        JWTService,
        { provide: getConnectionToken(), useValue: connection },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JWTService>(JWTService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${AuthGuard.name} should be defined`, () => {
    expect(guard).toBeDefined();
  });

  describe(AuthGuard.name, () => {
    const message = 'Unauthorized';

    test('should return true', async () => {
      const payload = { id: 1 };
      const token = jwtService.getToken(payload);

      const limit = jest.fn().mockResolvedValue([payload]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { userId: 1 },
            headers: { authorization: `Bearer ${token}` },
          }),
        }),
      } as ExecutionContext;

      const response = await guard.canActivate(context);
      expect.assertions(5);
      expect(response).toBeTruthy();
      expect(select).toBeCalledTimes(1);
      expect(from).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
    });

    test('should throw error if authorization header is not set', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { userId: 1 },
            headers: {},
          }),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.UNAUTHORIZED),
        );
      }
    });

    test('should throw error if token type is not bearer', async () => {
      const payload = { id: 1 };
      const token = jwtService.getToken(payload);

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { userId: 1 },
            headers: { authorization: `Basic ${token}` },
          }),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.UNAUTHORIZED),
        );
      }
    });

    test('should throw error if token is a JWT', async () => {
      const token = 'not a jwt';

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { userId: 1 },
            headers: { authorization: `Bearer ${token}` },
          }),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.UNAUTHORIZED),
        );
      }
    });

    test('should throw error if userId does not match', async () => {
      const payload = { id: 1 };
      const token = jwtService.getToken(payload);

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { userId: 2 },
            headers: { authorization: `Bearer ${token}` },
          }),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.UNAUTHORIZED),
        );
      }
    });

    test('should throw error if user does not exist', async () => {
      const payload = { id: 1 };
      const token = jwtService.getToken(payload);

      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { userId: 1 },
            headers: { authorization: `Bearer ${token}` },
          }),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.UNAUTHORIZED),
        );
      }
    });

    test('should throw an error when there is a connection problem', async () => {
      const message = 'Database error';
      const payload = { id: 1 };
      const token = jwtService.getToken(payload);

      const limit = jest.fn().mockRejectedValue(new Error(message));
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            body: { userId: 1 },
            headers: { authorization: `Bearer ${token}` },
          }),
        }),
      } as ExecutionContext;

      try {
        await guard.canActivate(context);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });
  });
});

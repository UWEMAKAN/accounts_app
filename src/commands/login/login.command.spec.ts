import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { isJWT } from 'class-validator';
import { getConnectionToken } from 'nest-knexjs';
import { JWTService, PasswordService } from '../../services';
import { LoginCommand, LoginCommandHandler } from './login.command';

describe(LoginCommandHandler.name, () => {
  let module: TestingModule;
  let handler: LoginCommandHandler;
  let passwordService: PasswordService;

  const connection = {
    select: jest.fn(),
  };
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

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        LoginCommandHandler,
        PasswordService,
        JWTService,
        { provide: ConfigService, useValue: configService },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();
    handler = module.get<LoginCommandHandler>(LoginCommandHandler);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${LoginCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe(LoginCommandHandler.name, () => {
    test('should login succesfully', async () => {
      const email = 'bender.rodriguez@futura.ma';
      const password = 'PlanetOmicron';
      const { passwordHash, salt } = passwordService.hashPassword(password);
      const user = { id: 1, email, passwordHash, salt };

      const limit = jest.fn().mockResolvedValue([user]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const command = new LoginCommand({ email, password });
      const response = await handler.execute(command);

      expect.assertions(6);
      expect(isJWT(response.token)).toBe(true);
      expect(response.userId).toBe(user.id);
      expect(select).toBeCalledTimes(1);
      expect(from).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
    });

    test('should fail to login because user was not found', async () => {
      const email = 'bender.rodriguez@futura.ma';
      const password = 'PlanetOmicron';
      const message = 'Invalid email/password';

      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const command = new LoginCommand({ email, password });

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
      }
    });

    test('should fail to login because of incorrect password', async () => {
      const email = 'bender.rodriguez@futura.ma';
      const password = 'PlanetOmicron';
      const { passwordHash, salt } =
        passwordService.hashPassword('PlanetExpress');
      const user = { id: 1, email, passwordHash, salt };
      const message = 'Invalid email/password';

      const limit = jest.fn().mockResolvedValue([user]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const command = new LoginCommand({ email, password });

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
      }
    });

    test('should fail to login because of a system error', async () => {
      const email = 'bender.rodriguez@futura.ma';
      const password = 'PlanetOmicron';
      const message = 'Database error';

      const limit = jest.fn().mockRejectedValue(new Error(message));
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const command = new LoginCommand({ email, password });

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });
  });
});

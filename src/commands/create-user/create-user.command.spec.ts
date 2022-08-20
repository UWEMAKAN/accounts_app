import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../../entities';
import { JWTPayload, JWTService, PasswordService } from '../../services';
import {
  CreateUserCommand,
  CreateUserCommandHandler,
} from './create-user.command';
import { HttpException, HttpStatus } from '@nestjs/common';

describe(CreateUserCommandHandler.name, () => {
  let module: TestingModule;
  let handler: CreateUserCommandHandler;

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
    insert: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CreateUserCommandHandler,
        JWTService,
        PasswordService,
        { provide: ConfigService, useValue: configService },
        { provide: getConnectionToken('default'), useValue: connection },
      ],
    }).compile();

    handler = module.get<CreateUserCommandHandler>(CreateUserCommandHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${CreateUserCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe(`${CreateUserCommandHandler.name}.execute`, () => {
    const firstName = 'Bender';
    const lastName = 'Rodriguez';
    const email = 'bender.rodriguez@futura.ma';
    const password = 'PlanetOmicron';

    test('should create a new user successfully', async () => {
      const user = {
        id: 1,
        firstName,
        lastName,
        email,
      } as User;

      const payload: JWTPayload = {
        id: user.id,
        email,
      };
      const token = jwt.sign(payload, 'test_nonce', {
        expiresIn: '24h',
        algorithm: 'HS256',
      });

      const into = jest.fn().mockResolvedValue([1]);
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([user]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });

      connection.insert = insert;
      connection.select = select;

      const command = new CreateUserCommand({
        firstName,
        lastName,
        email,
        password,
      });

      const response = await handler.execute(command);
      expect.assertions(2);
      expect(response.userId).toBe(user.id);
      expect(response.token).toBe(token);
    });

    test('should throw an error with message Database error', async () => {
      const message = 'Database error';
      const into = jest.fn().mockRejectedValue(new Error(message));
      const insert = jest.fn().mockReturnValue({ into });
      connection.insert = insert;

      const command = new CreateUserCommand({
        firstName,
        lastName,
        email,
        password,
      });

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });

    test('should throw an error with message User creation failed', async () => {
      const message = 'User creation failed';
      const into = jest.fn().mockResolvedValue([]);
      const insert = jest.fn().mockReturnValue({ into });
      connection.insert = insert;

      const command = new CreateUserCommand({
        firstName,
        lastName,
        email,
        password,
      });

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
      }
    });

    test('should throw an error with message User creation failed', async () => {
      const message = 'Database error';
      const into = jest.fn().mockResolvedValue([1]);
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockRejectedValue(new Error(message));
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });

      connection.insert = insert;
      connection.select = select;

      const command = new CreateUserCommand({
        firstName,
        lastName,
        email,
        password,
      });

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
      }
    });
  });
});

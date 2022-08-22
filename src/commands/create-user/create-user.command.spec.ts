import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import { PasswordService } from '../../services';
import {
  CreateUserCommand,
  CreateUserCommandHandler,
} from './create-user.command';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

describe(CreateUserCommandHandler.name, () => {
  let module: TestingModule;
  let handler: CreateUserCommandHandler;

  const connection = {
    select: jest.fn(),
    insert: jest.fn(),
  };
  const commandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CreateUserCommandHandler,
        PasswordService,
        { provide: CommandBus, useValue: commandBus },
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
      const message = 'User creation successful';
      const user = { id: 1 };

      const into = jest.fn().mockResolvedValue([1]);
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([user]);
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
      expect.assertions(9);
      expect(into).toBeCalledTimes(1);
      expect(insert).toBeCalledTimes(1);
      expect(select).toBeCalledTimes(2);
      expect(from).toBeCalledTimes(2);
      expect(where).toBeCalledTimes(2);
      expect(limit).toBeCalledTimes(2);
      expect(response.statusCode).toBe(201);
      expect(response.message).toBe(message);
      expect(commandBus.execute).toBeCalledTimes(1);
    });

    test('should fail when reading from database', async () => {
      const message = 'Database error';
      const limit = jest.fn().mockRejectedValue(new Error(message));
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
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
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });

    test('should fail because email already exists', async () => {
      const message = 'Email already exists';
      const user = { id: 1, firstName, lastName, email };
      const limit = jest.fn().mockResolvedValue([user]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
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

    test('should fail when inserting into database', async () => {
      const message = 'Database error';
      const into = jest.fn().mockRejectedValue(new Error(message));
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([]);
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
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });
  });
});

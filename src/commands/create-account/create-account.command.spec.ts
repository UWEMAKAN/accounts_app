import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import {
  CreateAccountCommand,
  CreateAccountCommandHandler,
} from './create-account.command';

describe(CreateAccountCommandHandler.name, () => {
  let module: TestingModule;
  let handler: CreateAccountCommandHandler;

  const connection = {
    select: jest.fn(),
    insert: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        CreateAccountCommandHandler,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    handler = module.get<CreateAccountCommandHandler>(
      CreateAccountCommandHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${CreateAccountCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe(CreateAccountCommandHandler.name, () => {
    const userId = 1;
    const openingBalance = 1000;

    test('should create an account successfully', async () => {
      const into = jest.fn().mockResolvedValue([1]);
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });

      connection.insert = insert;
      connection.select = select;

      const dto = { userId, openingBalance };
      const command = new CreateAccountCommand(dto);

      const response = await handler.execute(command);

      expect.assertions(8);
      expect(into).toBeCalledTimes(1);
      expect(insert).toBeCalledTimes(1);
      expect(select).toBeCalledTimes(1);
      expect(from).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
      expect(response.message).toBe('Account creation successful');
      expect(response.statusCode).toBe(201);
    });

    test('should create an account successfully with default opening balance', async () => {
      const into = jest.fn().mockResolvedValue([1]);
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });

      connection.insert = insert;
      connection.select = select;

      const dto = { userId };
      const command = new CreateAccountCommand(dto);

      const response = await handler.execute(command);

      expect.assertions(8);
      expect(into).toBeCalledTimes(1);
      expect(insert).toBeCalledTimes(1);
      expect(select).toBeCalledTimes(1);
      expect(from).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
      expect(response.message).toBe('Account creation successful');
      expect(response.statusCode).toBe(201);
    });

    test('should fail when reading from database', async () => {
      const message = 'Database error';
      const limit = jest.fn().mockRejectedValue(new Error(message));
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const dto = { userId, openingBalance };
      const command = new CreateAccountCommand(dto);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });

    test('should fail because account already exists', async () => {
      const message = 'Account already exists';
      const account = { id: 1, balance: openingBalance, userId };
      const limit = jest.fn().mockResolvedValue([account]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const dto = { userId, openingBalance };
      const command = new CreateAccountCommand(dto);

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

      const dto = { userId, openingBalance };
      const command = new CreateAccountCommand(dto);

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

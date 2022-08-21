import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import {
  NewTransactionCommand,
  NewTransactionCommandHandler,
} from './new-transaction.command';

describe(NewTransactionCommandHandler.name, () => {
  let module: TestingModule;
  let handler: NewTransactionCommandHandler;

  const trx = {
    select: jest.fn(),
    update: jest.fn(),
    insert: jest.fn(),
    rollback: jest.fn(),
    commit: jest.fn(),
  };

  const connection = {
    transaction: jest.fn().mockReturnValue(trx),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        NewTransactionCommandHandler,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();
    handler = module.get<NewTransactionCommandHandler>(
      NewTransactionCommandHandler,
    );
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${NewTransactionCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe(NewTransactionCommandHandler.name, () => {
    const userId = 1;
    const accountId = 1;
    const amount = 1000;

    test('should add to account balance', async () => {
      const account = { id: 1, balance: 2000, userId: 1 };
      const dto = { accountId, amount, userId };
      const command = new NewTransactionCommand(dto, 'CREDIT');

      const into = jest.fn();
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([account]);

      const andWhere = jest.fn().mockReturnValue({ limit });
      const where = jest.fn().mockReturnValue({ andWhere });
      const table = jest.fn().mockReturnValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockReturnValue(trx);

      const response = await handler.execute(command);
      expect.assertions(11);
      expect(response.message).toBe('Transaction successful');
      expect(response.statusCode).toBe(200);
      expect(into).toBeCalledTimes(1);
      expect(insert).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
      expect(andWhere).toBeCalledTimes(2);
      expect(where).toBeCalledTimes(2);
      expect(table).toBeCalledTimes(1);
      expect(update).toBeCalledTimes(1);
      expect(forUpdate).toBeCalledTimes(1);
      expect(select).toBeCalledTimes(1);
    });

    test('should subtract from account balance', async () => {
      const account = { id: 1, balance: 2000, userId: 1 };
      const dto = { accountId, amount, userId };
      const command = new NewTransactionCommand(dto, 'DEBIT');

      const into = jest.fn();
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([account]);

      const andWhere = jest.fn().mockReturnValue({ limit });
      const where = jest.fn().mockReturnValue({ andWhere });
      const table = jest.fn().mockReturnValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockReturnValue(trx);

      const response = await handler.execute(command);
      expect.assertions(11);
      expect(response.message).toBe('Transaction successful');
      expect(response.statusCode).toBe(200);
      expect(into).toBeCalledTimes(1);
      expect(insert).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
      expect(andWhere).toBeCalledTimes(2);
      expect(where).toBeCalledTimes(2);
      expect(table).toBeCalledTimes(1);
      expect(update).toBeCalledTimes(1);
      expect(forUpdate).toBeCalledTimes(1);
      expect(select).toBeCalledTimes(1);
    });

    test('should fail to find account', async () => {
      const message = 'Database error';
      const dto = { accountId, amount, userId };
      const command = new NewTransactionCommand(dto, 'DEBIT');

      const limit = jest.fn().mockRejectedValue(new Error(message));

      const andWhere = jest.fn().mockReturnValue({ limit });
      const where = jest.fn().mockReturnValue({ andWhere });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.select = select;
      connection.transaction = jest.fn().mockReturnValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should find an Invalid Account', async () => {
      const message = 'Invalid Account';
      const dto = { accountId, amount, userId };
      const command = new NewTransactionCommand(dto, 'DEBIT');

      const limit = jest.fn().mockResolvedValue([]);

      const andWhere = jest.fn().mockReturnValue({ limit });
      const where = jest.fn().mockReturnValue({ andWhere });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.select = select;
      connection.transaction = jest.fn().mockReturnValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail because of Insufficient balance', async () => {
      const message = 'Insufficient balance';
      const account = { id: 1, balance: 2000, userId: 1 };
      const dto = { accountId, amount: 5000, userId };
      const command = new NewTransactionCommand(dto, 'DEBIT');

      const limit = jest.fn().mockResolvedValue([account]);

      const andWhere = jest.fn().mockReturnValue({ limit });
      const where = jest.fn().mockReturnValue({ andWhere });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.select = select;
      connection.transaction = jest.fn().mockReturnValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail to update account balance', async () => {
      const message = 'Database error';
      const account = { id: 1, balance: 2000, userId: 1 };
      const dto = { accountId, amount, userId };
      const command = new NewTransactionCommand(dto, 'DEBIT');

      const limit = jest.fn().mockResolvedValue([account]);

      const andWhere = jest.fn().mockReturnValue({ limit });
      const where = jest.fn().mockReturnValue({ andWhere });
      const table = jest.fn().mockResolvedValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockReturnValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail fail to insert entry', async () => {
      const message = 'Database error';
      const account = { id: 1, balance: 2000, userId: 1 };
      const dto = { accountId, amount, userId };
      const command = new NewTransactionCommand(dto, 'DEBIT');

      const into = jest.fn().mockRejectedValue(new Error(message));
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([account]);

      const andWhere = jest.fn().mockReturnValue({ limit });
      const where = jest.fn().mockReturnValue({ andWhere });
      const table = jest.fn().mockReturnValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockReturnValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });
  });
});

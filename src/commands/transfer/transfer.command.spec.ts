import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import { TransferCommand, TransferCommandHandler } from './transfer.command';

describe(TransferCommandHandler.name, () => {
  let module: TestingModule;
  let handler: TransferCommandHandler;

  const trx = {
    select: jest.fn(),
    update: jest.fn(),
    insert: jest.fn(),
    rollback: jest.fn(),
    commit: jest.fn(),
  };

  const connection = {
    transaction: jest.fn().mockResolvedValue(trx),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TransferCommandHandler,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();
    handler = module.get<TransferCommandHandler>(TransferCommandHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${TransferCommandHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe(`${TransferCommandHandler.name}.execute`, () => {
    test('should transfer successfully', async () => {
      const dto = { amount: 1000, userId: 1, recipientId: 2 };
      const account = { id: 1, balance: 2000 };
      const command = new TransferCommand(dto);

      const into = jest.fn();
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([account]);

      const where = jest.fn().mockReturnValue({ limit });
      const table = jest.fn().mockReturnValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      const response = await handler.execute(command);
      expect.assertions(11);
      expect(response.message).toBe('Transfer successful');
      expect(response.statusCode).toBe(200);
      expect(into).toBeCalledTimes(3);
      expect(insert).toBeCalledTimes(3);
      expect(limit).toBeCalledTimes(2);
      expect(where).toBeCalledTimes(4);
      expect(table).toBeCalledTimes(2);
      expect(update).toBeCalledTimes(2);
      expect(forUpdate).toBeCalledTimes(2);
      expect(select).toBeCalledTimes(2);
      expect(trx.commit).toBeCalledTimes(1);
    });

    test('should transfer successfully', async () => {
      const dto = { amount: 1000, userId: 2, recipientId: 1 };
      const account = { id: 1, balance: 2000 };
      const command = new TransferCommand(dto);

      const into = jest.fn();
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([account]);

      const where = jest.fn().mockReturnValue({ limit });
      const table = jest.fn().mockReturnValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      const response = await handler.execute(command);
      expect.assertions(11);
      expect(response.message).toBe('Transfer successful');
      expect(response.statusCode).toBe(200);
      expect(into).toBeCalledTimes(3);
      expect(insert).toBeCalledTimes(3);
      expect(limit).toBeCalledTimes(2);
      expect(where).toBeCalledTimes(4);
      expect(table).toBeCalledTimes(2);
      expect(update).toBeCalledTimes(2);
      expect(forUpdate).toBeCalledTimes(2);
      expect(select).toBeCalledTimes(2);
      expect(trx.commit).toBeCalledTimes(1);
    });

    test('should fail to transfer', async () => {
      const dto = { amount: 1000, userId: 1, recipientId: 1 };
      const message = 'Cannot transfer';
      const command = new TransferCommand(dto);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
      }
    });

    test('should fail to transfer because of insufficient balance', async () => {
      const message = 'Insufficient balance';
      const dto = { amount: 3000, userId: 2, recipientId: 1 };
      const account = { id: 1, balance: 1000 };
      const command = new TransferCommand(dto);

      const limit = jest.fn().mockResolvedValue([account]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });
      trx.select = select;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail to insert a new entry', async () => {
      const dto = { amount: 1000, userId: 2, recipientId: 1 };
      const account = { id: 1, balance: 3000 };
      const command = new TransferCommand(dto);
      const message = 'Database error';

      const into = jest.fn().mockRejectedValue(new Error(message));
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([account]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.select = select;
      trx.insert = insert;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail to update account balance', async () => {
      const dto = { amount: 1000, userId: 2, recipientId: 1 };
      const account = { id: 1, balance: 3000 };
      const command = new TransferCommand(dto);
      const message = 'Database error';

      const into = jest.fn();
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([account]);

      const where = jest.fn().mockReturnValue({ limit });
      const table = jest.fn().mockResolvedValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail to retrieve account', async () => {
      const dto = { amount: 1000, userId: 2, recipientId: 1 };
      const command = new TransferCommand(dto);
      const message = 'Database error';

      const into = jest.fn();
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockRejectedValue(new Error(message));

      const where = jest.fn().mockReturnValue({ limit });
      const table = jest.fn().mockReturnValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail to retrieve account', async () => {
      const dto = { amount: 1000, userId: 2, recipientId: 1 };
      const command = new TransferCommand(dto);
      const message = 'Invalid Account';

      const into = jest.fn();
      const insert = jest.fn().mockReturnValue({ into });

      const limit = jest.fn().mockResolvedValue([]);

      const where = jest.fn().mockReturnValue({ limit });
      const table = jest.fn().mockReturnValue({ where });
      const update = jest.fn().mockReturnValue({ table });

      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.insert = insert;
      trx.select = select;
      trx.update = update;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });

    test('should fail to insert transfer record', async () => {
      const dto = { amount: 1000, userId: 2, recipientId: 1 };
      const account = { id: 1, balance: 3000 };
      const command = new TransferCommand(dto);
      const message = 'Database error';

      const into = jest.fn();
      const insert = jest
        .fn()
        .mockReturnValueOnce({ into })
        .mockReturnValueOnce({ into })
        .mockReturnValueOnce(new Error(message));

      const limit = jest.fn().mockResolvedValue([account]);
      const where = jest.fn().mockReturnValue({ limit });
      const from = jest.fn().mockReturnValue({ where });
      const forUpdate = jest.fn().mockReturnValue({ from });
      const select = jest.fn().mockReturnValue({ forUpdate });

      trx.select = select;
      trx.insert = insert;
      connection.transaction = jest.fn().mockResolvedValue(trx);

      try {
        await handler.execute(command);
      } catch (err) {
        expect.assertions(2);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.BAD_REQUEST),
        );
        expect(trx.rollback).toBeCalledTimes(1);
      }
    });
  });
});

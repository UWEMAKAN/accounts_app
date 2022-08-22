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

    test('should create an account successfully', async () => {
      const into = jest.fn().mockResolvedValue([1]);
      const insert = jest.fn().mockReturnValue({ into });
      connection.insert = insert;

      const command = new CreateAccountCommand(userId);
      await handler.execute(command);

      expect.assertions(2);
      expect(into).toBeCalledTimes(1);
      expect(insert).toBeCalledTimes(1);
    });

    test('should fail when inserting into database', async () => {
      const message = 'Database error';
      const into = jest.fn().mockRejectedValue(new Error(message));
      const insert = jest.fn().mockReturnValue({ into });
      connection.insert = insert;

      const command = new CreateAccountCommand(userId);

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

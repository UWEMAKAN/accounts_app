import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import {
  UserDetailsQuery,
  UserDetailsQueryHandler,
} from './user-details.query';

describe(UserDetailsQueryHandler.name, () => {
  let module: TestingModule;
  let handler: UserDetailsQueryHandler;

  const connection = {
    select: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        UserDetailsQueryHandler,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();
    handler = module.get<UserDetailsQueryHandler>(UserDetailsQueryHandler);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${UserDetailsQueryHandler.name} should be defined`, () => {
    expect(handler).toBeDefined();
  });

  describe(UserDetailsQueryHandler.name, () => {
    test('should return user details', async () => {
      const firstName = 'Bender';
      const lastName = 'Rodriguez';
      const email = 'bender.rodriguez@futura.ma';
      const balance = 1000;

      const accountDetails = { id: 1, firstName, lastName, email, balance };

      const limit = jest.fn().mockResolvedValue([accountDetails]);
      const where = jest.fn().mockReturnValue({ limit });
      const leftJoin = jest.fn().mockReturnValue({ where });
      const from = jest.fn().mockReturnValue({ leftJoin });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;

      const query = new UserDetailsQuery(1);
      const response = await handler.execute(query);
      expect.assertions(10);
      expect(response.balance).toBe(balance);
      expect(response.email).toBe(email);
      expect(response.firstName).toBe(firstName);
      expect(response.id).toBe(1);
      expect(response.lastName).toBe(lastName);
      expect(select).toBeCalledTimes(1);
      expect(from).toBeCalledTimes(1);
      expect(leftJoin).toBeCalledTimes(1);
      expect(where).toBeCalledTimes(1);
      expect(limit).toBeCalledTimes(1);
    });

    test('should fail to return user details', async () => {
      const message = 'Database error';
      const limit = jest.fn().mockRejectedValue(new Error(message));
      const where = jest.fn().mockReturnValue({ limit });
      const leftJoin = jest.fn().mockReturnValue({ where });
      const from = jest.fn().mockReturnValue({ leftJoin });
      const select = jest.fn().mockReturnValue({ from });
      connection.select = select;
      const query = new UserDetailsQuery(1);

      try {
        await handler.execute(query);
      } catch (err) {
        expect.assertions(1);
        expect(err).toStrictEqual(
          new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR),
        );
      }
    });
  });
});

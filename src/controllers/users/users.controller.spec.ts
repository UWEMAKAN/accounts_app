import { ConfigService } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import { CreateUserCommand, LoginCommand } from '../../commands';
import { UserDetailsQuery } from '../../queries';
import { JWTService } from '../../services';
import { AuthGuard } from '../../utils/guards/auth/auth.guard';
import { UsersController } from './users.controller';

describe(UsersController.name, () => {
  let module: TestingModule;
  let controller: UsersController;

  const commandBus = {
    execute: jest.fn(),
  };
  const queryBus = {
    execute: jest.fn(),
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
      controllers: [UsersController],
      providers: [
        AuthGuard,
        JWTService,
        { provide: getConnectionToken(), useValue: {} },
        { provide: ConfigService, useValue: configService },
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${UsersController.name} should be defined`, () => {
    expect(controller).toBeDefined();
  });

  describe(`${UsersController.name}.createUser`, () => {
    test('should call commandBus.execute', async () => {
      const firstName = 'Bender';
      const lastName = 'Rodriguez';
      const email = 'bender.rodriguez@futura.ma';
      const password = 'PlanetOmicron';

      const dto = { firstName, lastName, email, password };
      const command = new CreateUserCommand(dto);
      await controller.createUser(dto);

      expect.assertions(2);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(command);
    });
  });

  describe(`${UsersController.name}.login`, () => {
    test('should call commandBus.execute', async () => {
      const email = 'bender.rodriguez@futura.ma';
      const password = 'PlanetOmicron';

      const dto = { email, password };
      const command = new LoginCommand(dto);
      await controller.login(dto);

      expect.assertions(2);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(command);
    });
  });

  describe(`${UsersController.name}.userDetails`, () => {
    test('should call commandBus.execute', async () => {
      const query = new UserDetailsQuery(1);
      await controller.userDetails(1);

      expect.assertions(2);
      expect(queryBus.execute).toBeCalledTimes(1);
      expect(queryBus.execute).toBeCalledWith(query);
    });
  });
});

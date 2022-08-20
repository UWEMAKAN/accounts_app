import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserCommand } from '../../commands';
import { UsersController } from './users.controller';

describe(UsersController.name, () => {
  let module: TestingModule;
  let controller: UsersController;

  const commandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: CommandBus, useValue: commandBus }],
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
});

import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountCommand } from '../../commands/create-account/create-account.command';
import { AccountsController } from './accounts.controller';

describe(AccountsController.name, () => {
  let module: TestingModule;
  let controller: AccountsController;

  const commandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [{ provide: CommandBus, useValue: commandBus }],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await module.close();
  });

  test(`${AccountsController.name} should be defined`, () => {
    expect(controller).toBeDefined();
  });

  describe(`${AccountsController.name}.createUser`, () => {
    test('should call commandBus.execute', async () => {
      const userId = 1;
      const openingBalance = 1000;

      const dto = { userId, openingBalance };
      const command = new CreateAccountCommand(dto);
      await controller.createAccount(dto);

      expect.assertions(2);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(command);
    });
  });
});

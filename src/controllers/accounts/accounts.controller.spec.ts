import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from 'nest-knexjs';
import { CreateAccountCommand, NewTransactionCommand } from '../../commands';
import { JWTService } from '../../services';
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
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: ConfigService, useValue: {} },
        JWTService,
        { provide: getConnectionToken(), useValue: {} },
      ],
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
    test('should call commandBus.execute for createAccount', async () => {
      const userId = 1;
      const openingBalance = 1000;

      const dto = { userId, openingBalance };
      const command = new CreateAccountCommand(dto);
      await controller.createAccount(dto);

      expect.assertions(2);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(command);
    });

    test('should call commandBus.execute for fundAccount', async () => {
      const userId = 1;
      const amount = 1000;
      const accountId = 1;

      const dto = { userId, amount, accountId };
      const command = new NewTransactionCommand(dto, 'CREDIT');
      await controller.fundAccount(dto);

      expect.assertions(2);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(command);
    });

    test('should call commandBus.execute for withdraw', async () => {
      const userId = 1;
      const amount = 1000;
      const accountId = 1;

      const dto = { userId, amount, accountId };
      const command = new NewTransactionCommand(dto, 'DEBIT');
      await controller.withdraw(dto);

      expect.assertions(2);
      expect(commandBus.execute).toBeCalledTimes(1);
      expect(commandBus.execute).toBeCalledWith(command);
    });
  });
});

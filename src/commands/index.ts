import { CreateAccountCommandHandler } from './create-account/create-account.command';
import { CreateUserCommandHandler } from './create-user/create-user.command';
import { LoginCommandHandler } from './login/login.command';
import { NewTransactionCommandHandler } from './new-transaction/new-transaction.command';
import { TransferCommandHandler } from './transfer/transfer.command';

export * from './create-account/create-account.command';
export * from './create-user/create-user.command';
export * from './login/login.command';
export * from './new-transaction/new-transaction.command';
export * from './transfer/transfer.command';

export const commandHandlers = [
  CreateAccountCommandHandler,
  CreateUserCommandHandler,
  LoginCommandHandler,
  NewTransactionCommandHandler,
  TransferCommandHandler,
];

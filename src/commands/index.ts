import { CreateAccountCommandHandler } from './create-account/create-account.command';
import { CreateUserCommandHandler } from './create-user/create-user.command';
import { NewTransactionCommandHandler } from './new-transaction/new-transaction.command';

export * from './create-account/create-account.command';
export * from './create-user/create-user.command';
export * from './new-transaction/new-transaction.command';

export const commandHandlers = [
  CreateAccountCommandHandler,
  CreateUserCommandHandler,
  NewTransactionCommandHandler,
];

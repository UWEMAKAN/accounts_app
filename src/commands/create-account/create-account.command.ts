import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';

export class CreateAccountCommand implements ICommand {
  constructor(public readonly userId: number) {}
}

@CommandHandler(CreateAccountCommand)
export class CreateAccountCommandHandler
  implements ICommandHandler<CreateAccountCommand>
{
  private readonly logger: Logger;

  constructor(
    @InjectConnection()
    private readonly connection: Knex,
  ) {
    this.logger = new Logger(CreateAccountCommandHandler.name);
  }

  async execute(command: CreateAccountCommand): Promise<void> {
    const { userId } = command;

    try {
      await this.connection.insert({ userId }).into('accounts');
    } catch (err) {
      this.logger.log(`${JSON.stringify(err)}`);
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

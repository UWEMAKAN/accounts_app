import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateAccountRequest, GeneralResponse } from '../../dtos';
import { Account } from '../../entities';

export class CreateAccountCommand implements ICommand {
  constructor(public readonly data: CreateAccountRequest) {}
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

  async execute(command: CreateAccountCommand): Promise<GeneralResponse> {
    const { userId, openingBalance } = command.data;
    const balance = openingBalance ? openingBalance : 0;

    let account: Account = null;
    try {
      [account] = await this.connection
        .select('id')
        .from('accounts')
        .where('accounts.userId', userId)
        .limit(1);
    } catch (err) {
      this.logger.log(`${JSON.stringify(err)}`);
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (account) {
      throw new HttpException('Account already exists', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.connection
        .insert({
          userId,
          balance,
        })
        .into('accounts');
    } catch (err) {
      this.logger.log(`${JSON.stringify(err)}`);
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const response = new GeneralResponse();
    response.statusCode = 201;
    response.message = 'Account creation successful';
    return response;
  }
}

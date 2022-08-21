import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { NewTransactionRequest, GeneralResponse } from '../../dtos';
import { Account } from '../../entities';
import { TransactionType } from '../../utils/types';

export class NewTransactionCommand implements ICommand {
  constructor(
    public readonly data: NewTransactionRequest,
    public readonly type: TransactionType,
  ) {}
}

@CommandHandler(NewTransactionCommand)
export class NewTransactionCommandHandler
  implements ICommandHandler<NewTransactionCommand>
{
  private readonly logger: Logger;

  constructor(
    @InjectConnection()
    private readonly connection: Knex,
  ) {
    this.logger = new Logger(NewTransactionCommandHandler.name);
  }

  async execute(command: NewTransactionCommand): Promise<GeneralResponse> {
    const {
      data: { amount, userId },
      type,
    } = command;

    const trx = await this.connection.transaction();
    let account: Account = null;

    try {
      [account] = await trx
        .select('*')
        .forUpdate()
        .from('accounts')
        .where('accounts.userId', userId)
        .limit(1);
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      await trx.rollback();
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!account) {
      await trx.rollback();
      throw new HttpException('Invalid Account', HttpStatus.BAD_REQUEST);
    }

    if (type === 'DEBIT' && account.balance < amount) {
      await trx.rollback();
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    const amountToAdd = type === 'CREDIT' ? amount : -amount;
    try {
      await trx
        .update({ balance: account.balance + amountToAdd })
        .table('accounts')
        .where('accounts.id', account.id);
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      await trx.rollback();
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await trx
        .insert({
          amount: amountToAdd,
          accountId: account.id,
        })
        .into('entries');
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      await trx.rollback();
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    await trx.commit();

    const response = new GeneralResponse();
    response.message = 'Transaction successful';
    response.statusCode = 200;
    return response;
  }
}

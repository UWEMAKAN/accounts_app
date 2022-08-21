import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import {
  NewTransactionRequestDto,
  NewTransactionResponseDto,
} from '../../dtos';
import { Account } from '../../entities';
import { TransactionType } from '../../utils/types';

export class NewTransactionCommand implements ICommand {
  constructor(
    public readonly data: NewTransactionRequestDto,
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

  async execute(
    command: NewTransactionCommand,
  ): Promise<NewTransactionResponseDto> {
    const {
      data: { amount, userId, accountId },
      type,
    } = command;

    const trx = await this.connection.transaction();
    let account: Account = null;

    try {
      [account] = await trx
        .select('*')
        .forUpdate()
        .from('accounts')
        .where('accounts.id', accountId)
        .andWhere('accounts.userId', userId)
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
        .where('accounts.id', accountId)
        .andWhere('accounts.userId', userId);
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
          accountId,
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

    const response = new NewTransactionResponseDto();
    response.message = 'Transaction successful';
    response.statusCode = 200;
    return response;
  }
}

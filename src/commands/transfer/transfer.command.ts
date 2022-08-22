import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { GeneralResponse, TransferRequest } from '../../dtos';
import { Account } from '../../entities';

export class TransferCommand implements ICommand {
  constructor(public readonly data: TransferRequest) {}
}

@CommandHandler(TransferCommand)
export class TransferCommandHandler
  implements ICommandHandler<TransferCommand>
{
  private readonly logger: Logger;

  constructor(
    @InjectConnection()
    private readonly connection: Knex,
  ) {
    this.logger = new Logger(TransferCommandHandler.name);
  }

  async execute(command: TransferCommand): Promise<GeneralResponse> {
    const { amount, userId, recipientId } = command.data;

    if (userId === recipientId) {
      throw new HttpException('Cannot transfer', HttpStatus.BAD_REQUEST);
    }

    const trx = await this.connection.transaction();

    let fromAccount: Account = null;
    let toAccount: Account = null;

    if (userId < recipientId) {
      fromAccount = await this.validateAccount(userId, trx);
      toAccount = await this.validateAccount(recipientId, trx);
    } else {
      toAccount = await this.validateAccount(recipientId, trx);
      fromAccount = await this.validateAccount(userId, trx);
    }

    if (fromAccount.balance < amount) {
      trx.rollback();
      throw new HttpException('Insufficient balance', HttpStatus.BAD_REQUEST);
    }

    await this.updateAccountBalance(fromAccount, -amount, trx);
    await this.updateAccountBalance(toAccount, amount, trx);

    await this.createEntry(fromAccount.id, -amount, trx);
    await this.createEntry(toAccount.id, amount, trx);

    await this.createTransfer(
      trx,
      fromAccount.id,
      toAccount.id,
      fromAccount.userId,
      toAccount.userId,
      amount,
    );

    await trx.commit();

    const response = new GeneralResponse();
    response.message = 'Transfer successful';
    response.statusCode = 200;
    return response;
  }

  private async createTransfer(
    trx: Knex.Transaction,
    fromAccountId: number,
    toAccountId: number,
    senderId: number,
    recipientId: number,
    amount: number,
  ) {
    try {
      await trx
        .insert({
          fromAccountId,
          toAccountId,
          senderId,
          recipientId,
          amount,
        })
        .into('transfers');
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      await trx.rollback();
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async createEntry(
    accountId: number,
    amount: number,
    trx: Knex.Transaction,
  ) {
    try {
      await trx
        .insert({
          amount,
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
  }

  private async updateAccountBalance(
    account: Account,
    amount: number,
    trx: Knex.Transaction,
  ) {
    try {
      await trx
        .update({ balance: account.balance + amount })
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
  }

  private async validateAccount(
    userId: number,
    trx: Knex.Transaction,
  ): Promise<Account> {
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

    return account;
  }
}

import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { UserDetailsResponse } from '../../dtos';

export class UserDetailsQuery implements IQuery {
  constructor(public readonly userId: number) {}
}

@QueryHandler(UserDetailsQuery)
export class UserDetailsQueryHandler
  implements IQueryHandler<UserDetailsQuery>
{
  private readonly logger: Logger;

  constructor(@InjectConnection() private readonly connection: Knex) {
    this.logger = new Logger(UserDetailsQueryHandler.name);
  }

  async execute(query: UserDetailsQuery): Promise<UserDetailsResponse> {
    const { userId } = query;

    let response: UserDetailsResponse = null;

    try {
      [response] = await this.connection
        .select('u.id', 'u.firstName', 'u.lastName', 'u.email', 'balance')
        .from('users as u')
        .leftJoin('accounts', 'u.id', 'accounts.userId')
        .where('u.id', userId)
        .limit(1);
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return response;
  }
}

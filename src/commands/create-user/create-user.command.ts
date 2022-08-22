import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommand,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateUserRequest, GeneralResponse } from '../../dtos';
import { PasswordService } from '../../services';
import { User } from '../../entities';
import { CreateAccountCommand } from '../create-account/create-account.command';

export class CreateUserCommand implements ICommand {
  constructor(public readonly data: CreateUserRequest) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand>
{
  private readonly logger: Logger;
  constructor(
    @InjectConnection()
    private readonly connection: Knex,
    private readonly passwordService: PasswordService,
    private readonly commandBus: CommandBus,
  ) {
    this.logger = new Logger(CreateUserCommandHandler.name);
  }
  async execute(command: CreateUserCommand): Promise<GeneralResponse> {
    const { firstName, lastName, email, password } = command.data;
    const { passwordHash, salt } = this.passwordService.hashPassword(password);

    let user: User = await this.getUser(email);

    if (user) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.connection
        .insert({
          firstName,
          lastName,
          email,
          passwordHash,
          salt,
        })
        .into('users');
    } catch (err) {
      this.logger.log(`${JSON.stringify(err)}`);
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    user = await this.getUser(email);

    await this.commandBus.execute(new CreateAccountCommand(user.id));

    const response = new GeneralResponse();
    response.message = 'User creation successful';
    response.statusCode = 201;
    return response;
  }

  private async getUser(email: string): Promise<User> {
    let user: User = null;
    try {
      [user] = await this.connection
        .select('id')
        .from('users')
        .where('users.email', email)
        .limit(1);
      return user;
    } catch (err) {
      this.logger.log(`${JSON.stringify(err)}`);
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

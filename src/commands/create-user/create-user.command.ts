import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateUserRequestDto, CreateUserResponseDto } from '../../dtos';
import { PasswordService } from '../../services';
import { User } from '../../entities';

export class CreateUserCommand implements ICommand {
  constructor(public readonly data: CreateUserRequestDto) {}
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
  ) {
    this.logger = new Logger(CreateUserCommandHandler.name);
  }
  async execute(command: CreateUserCommand): Promise<CreateUserResponseDto> {
    const { firstName, lastName, email, password } = command.data;
    const { passwordHash, salt } = this.passwordService.hashPassword(password);

    let user: User = null;
    try {
      [user] = await this.connection
        .select('id')
        .from('users')
        .where('users.email', email)
        .limit(1);
    } catch (err) {
      this.logger.log(`${JSON.stringify(err)}`);
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

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

    const response = new CreateUserResponseDto();
    response.message = 'User creation successful';
    response.statusCode = 201;
    return response;
  }
}

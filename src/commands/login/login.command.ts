import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { LoginRequest, LoginResponse } from '../../dtos/login.dto';
import { User } from '../../entities';
import { JWTService, PasswordService } from '../../services';

export class LoginCommand implements ICommand {
  constructor(public readonly data: LoginRequest) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  private readonly logger: Logger;

  constructor(
    @InjectConnection() private readonly connection: Knex,
    private readonly jwtService: JWTService,
    private readonly passwordService: PasswordService,
  ) {
    this.logger = new Logger(LoginCommandHandler.name);
  }

  async execute(command: LoginCommand): Promise<LoginResponse> {
    const { email, password } = command.data;

    let user: User = null;
    try {
      [user] = await this.connection
        .select('*')
        .from('users')
        .where('users.email', email)
        .limit(1);
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!user) {
      throw new HttpException('Invalid email/password', HttpStatus.BAD_REQUEST);
    }

    const isValid = this.passwordService.verifyPassword(
      password,
      user.salt,
      user.passwordHash,
    );

    if (!isValid) {
      throw new HttpException('Invalid email/password', HttpStatus.BAD_REQUEST);
    }

    const token = this.jwtService.getToken({ id: user.id });
    const response = new LoginResponse();
    response.userId = user.id;
    response.token = token;
    return response;
  }
}

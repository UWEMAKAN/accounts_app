import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isJWT } from 'class-validator';
import { Request } from 'express';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { User } from '../../../entities';
import { JWTService } from '../../../services';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger: Logger;

  constructor(
    @InjectConnection()
    private readonly connection: Knex,
    private readonly jwtService: JWTService,
  ) {
    this.logger = new Logger(AuthGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return await this.validateRequest(request);
  }

  private async validateRequest(request: Request) {
    const [bearer, token] = request.headers.authorization.split(' ');
    if (bearer.toLowerCase() !== 'bearer' || !isJWT(token)) {
      return false;
    }

    const id = await this.jwtService.verifyToken(token);
    const { userId } = request.body;
    if (userId !== id) {
      return false;
    }

    let user: User = null;
    try {
      [user] = await this.connection
        .select('id')
        .from('users')
        .where('users.id', userId)
        .limit(1);
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException(
        'Database error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!user) {
      return false;
    }

    return true;
  }
}

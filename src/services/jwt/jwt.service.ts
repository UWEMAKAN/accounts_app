import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: number;
  email: string;
}

@Injectable()
export class JWTService {
  private readonly logger: Logger;

  constructor(private readonly configService: ConfigService) {
    this.logger = new Logger(JWTService.name);
  }

  getToken(payload: JWTPayload): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiresIn = this.configService.get<string>('JWT_EXPIRATION');

    return jwt.sign(payload, secret, { expiresIn, algorithm: 'HS256' });
  }

  async verifyToken(token: string, payload: JWTPayload) {
    const secret = this.configService.get<string>('JWT_SECRET');

    let decoded = null;

    try {
      decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }

    const { id, email } = decoded;

    if (id !== payload.id || email !== payload.email) {
      throw new HttpException('Invalid User', HttpStatus.UNAUTHORIZED);
    }
  }
}

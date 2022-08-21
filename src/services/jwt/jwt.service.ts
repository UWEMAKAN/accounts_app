import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JWTPayload {
  id: number;
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

  async verifyToken(token: string): Promise<number> {
    const secret = this.configService.get<string>('JWT_SECRET');

    let decoded: string | jwt.JwtPayload = null;

    try {
      decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch (err) {
      this.logger.log(JSON.stringify(err));
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }

    if (typeof decoded === 'string') {
      throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
    }

    return decoded.id;
  }
}

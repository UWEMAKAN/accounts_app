import { JWTService } from './jwt/jwt.service';
import { PasswordService } from './password/password.service';

export * from './jwt/jwt.service';
export * from './password/password.service';

export const services = [JWTService, PasswordService];

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { KnexModule } from 'nest-knexjs';
import { commandHandlers } from './commands';
import { controllers } from './controllers';
import { queryHandlers } from './queries';
import { services } from './services';
import { LoggingInterceptor, ValidationPipe } from './utils';

const knexOptions = (configService: ConfigService) => ({
  config: {
    client: 'mysql2',
    connection: {
      host: configService.get<string>('DB_HOST'),
      user: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_NAME'),
    },
  },
});

@Module({
  imports: [
    CqrsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule.forRoot(knexOptions(new ConfigService())),
  ],
  controllers: [...controllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...services,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { KnexModule } from 'nest-knexjs';
import { AppController } from './app.controller';
import { commandHandlers } from './commands';
import { controllers } from './controllers';
import { services } from './services';
import { ValidationPipe } from './utils';

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
  controllers: [...controllers, AppController],
  providers: [
    ...commandHandlers,
    ...services,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule.forRoot(knexOptions(new ConfigService())),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

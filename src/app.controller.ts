import { Controller, Get } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection()
    private readonly knexConnection: Knex,
  ) {}

  @Get()
  getHello() {
    return this.knexConnection.table('users');
  }
}

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

  @Get('/find')
  async getUsers() {
    return await this.knexConnection.table('users');
  }

  @Get('')
  getHello() {
    return 'Hello World!';
  }
}

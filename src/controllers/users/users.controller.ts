import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateUserRequestDto, CreateUserResponseDto } from '../../dtos';

@Controller('users')
export class UsersController {
  constructor(
    @InjectConnection()
    private readonly knexConnection: Knex,
  ) {}

  /**
   * This endpoint is used for creating users on the system
   * @param dto CreateUserRequestDto
   * @returns CreateUserResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() dto: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = new CreateUserResponseDto();
    user.userId = 1;
    user.token = dto.email + dto.firstName;
    return user;
  }
}

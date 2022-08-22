import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand, LoginCommand } from '../../commands';
import { UserDetailsQuery } from '../../queries';
import {
  CreateUserRequest,
  GeneralResponse,
  LoginRequest,
  LoginResponse,
} from '../../dtos';
import { AuthGuard } from '../../utils/guards/auth/auth.guard';

@Controller('users')
export class UsersController {
  private readonly logger: Logger;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    this.logger = new Logger(UsersController.name);
  }

  /**
   * This endpoint is used for creating users on the system
   * @param dto CreateUserRequest
   * @returns GeneralResponse
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserRequest): Promise<GeneralResponse> {
    this.logger.log(`Executing ${UsersController.name}.createUser`);
    return await this.commandBus.execute(new CreateUserCommand(dto));
  }

  /**
   * Login endpoint
   * @param dto LoginRequest
   * @returns LoginResponse
   */
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequest): Promise<LoginResponse> {
    this.logger.log(`Executing ${UsersController.name}.login`);
    return await this.commandBus.execute(new LoginCommand(dto));
  }

  /**
   * Endpoint to get user details
   * @param id number
   * @returns UserDetailsQuery
   */
  @Get('/:id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async userDetails(@Param('id') id: number): Promise<UserDetailsQuery> {
    this.logger.log(`Executing ${UsersController.name}.userDetails`);
    return await this.queryBus.execute(new UserDetailsQuery(+id));
  }
}

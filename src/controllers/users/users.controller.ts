import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand, LoginCommand } from '../../commands';
import {
  CreateUserRequest,
  GeneralResponse,
  LoginRequest,
  LoginResponse,
} from '../../dtos';

@Controller('users')
export class UsersController {
  private readonly logger: Logger;

  constructor(private readonly commandBus: CommandBus) {
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
}

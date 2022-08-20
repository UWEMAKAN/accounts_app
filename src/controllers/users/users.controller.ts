import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../commands';
import { CreateUserRequestDto, CreateUserResponseDto } from '../../dtos';

@Controller('users')
export class UsersController {
  private readonly logger: Logger;

  constructor(private readonly commandBus: CommandBus) {
    this.logger = new Logger(UsersController.name);
  }

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
    this.logger.log(`In ${UsersController.name}.createUser`);
    return await this.commandBus.execute(new CreateUserCommand(dto));
  }
}

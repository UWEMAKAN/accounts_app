import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAccountCommand } from '../../commands/create-account/create-account.command';
import { CreateAccountRequestDto, CreateAccountResponseDto } from '../../dtos';

@Controller('accounts')
export class AccountsController {
  private readonly logger: Logger;

  constructor(private readonly commandBus: CommandBus) {
    this.logger = new Logger(AccountsController.name);
  }

  /**
   * This is endpoint allows a user to create a new account
   * @param dto CreateAccountRequestDto
   * @returns CreateAccountResponseDto
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Body() dto: CreateAccountRequestDto,
  ): Promise<CreateAccountResponseDto> {
    this.logger.log(`Executing ${AccountsController.name}.createAccount`);
    return await this.commandBus.execute(new CreateAccountCommand(dto));
  }
}

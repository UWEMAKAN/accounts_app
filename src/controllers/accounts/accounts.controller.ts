import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  // UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { NewTransactionCommand } from '../../commands';
import { CreateAccountCommand } from '../../commands/create-account/create-account.command';
import {
  CreateAccountRequestDto,
  CreateAccountResponseDto,
  NewTransactionRequestDto,
  NewTransactionResponseDto,
} from '../../dtos';
// import { AuthGuard } from '../../utils';

// @UseGuards(AuthGuard)
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

  /**
   * Endpoint for funding an account
   * @param dto NewTransactionRequestDto
   * @returns NewTransactionResponseDto
   */
  @Post('/fund')
  @HttpCode(HttpStatus.OK)
  async fundAccount(
    @Body() dto: NewTransactionRequestDto,
  ): Promise<NewTransactionResponseDto> {
    this.logger.log(`In ${AccountsController.name}.fundAccount`);
    return await this.commandBus.execute(
      new NewTransactionCommand(dto, 'CREDIT'),
    );
  }

  /**
   * Endpoint for withdrawing from an account
   * @param dto NewTransactionRequestDto
   * @returns NewTransactionResponseDto
   */
  @Post('/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(
    @Body() dto: NewTransactionRequestDto,
  ): Promise<NewTransactionResponseDto> {
    this.logger.log(`In ${AccountsController.name}.withdraw`);
    return await this.commandBus.execute(
      new NewTransactionCommand(dto, 'DEBIT'),
    );
  }
}

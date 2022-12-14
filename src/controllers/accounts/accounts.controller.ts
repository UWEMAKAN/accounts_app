import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { NewTransactionCommand, TransferCommand } from '../../commands';
import {
  GeneralResponse,
  NewTransactionRequest,
  TransferRequest,
} from '../../dtos';
import { AuthGuard } from '../../utils';

@UseGuards(AuthGuard)
@Controller('accounts')
export class AccountsController {
  private readonly logger: Logger;

  constructor(private readonly commandBus: CommandBus) {
    this.logger = new Logger(AccountsController.name);
  }

  /**
   * Endpoint for funding an account
   * @param dto NewTransactionRequest
   * @returns GeneralResponse
   */
  @Post('/fund')
  @HttpCode(HttpStatus.OK)
  async fundAccount(
    @Body() dto: NewTransactionRequest,
  ): Promise<GeneralResponse> {
    this.logger.log(`In ${AccountsController.name}.fundAccount`);
    return await this.commandBus.execute(
      new NewTransactionCommand(dto, 'CREDIT'),
    );
  }

  /**
   * Endpoint for withdrawing from an account
   * @param dto NewTransactionRequest
   * @returns GeneralResponse
   */
  @Post('/withdraw')
  @HttpCode(HttpStatus.OK)
  async withdraw(@Body() dto: NewTransactionRequest): Promise<GeneralResponse> {
    this.logger.log(`In ${AccountsController.name}.withdraw`);
    return await this.commandBus.execute(
      new NewTransactionCommand(dto, 'DEBIT'),
    );
  }

  /**
   *  Endpoint for making transfers
   * @param dto TransferRequest
   * @returns GeneralResponse
   */
  @Post('/transfer')
  @HttpCode(HttpStatus.OK)
  async transfer(@Body() dto: TransferRequest): Promise<GeneralResponse> {
    this.logger.log(`In ${AccountsController.name}.transfer`);
    return await this.commandBus.execute(new TransferCommand(dto));
  }
}

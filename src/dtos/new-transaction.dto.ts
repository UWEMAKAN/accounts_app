import { IsInt, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class NewTransactionRequestDto {
  /**
   * Amount to fund account with
   * @example 1000
   */
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
      maxDecimalPlaces: 2,
    },
    { message: 'amount must be greater 0 with 2 decimal places max' },
  )
  @IsPositive()
  public readonly amount: number;

  /**
   * id of the user funding account
   * @example 1
   */
  @IsInt()
  @Min(1)
  public readonly userId: number;

  /**
   * id of the account to fund
   * @example 1
   */
  @IsInt()
  @Min(1)
  public readonly accountId: number;
}

export class NewTransactionResponseDto {
  /**
   * status of the operation
   * @example 200
   */
  @IsInt()
  statusCode: number;

  /**
   * Message describing the state of the operation
   * @example 'Account funding successful'
   */
  @IsString()
  message: string;
}

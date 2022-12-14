import { IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export class NewTransactionRequest {
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
}

import { IsNumber, IsPositive, Min } from 'class-validator';

export class TransferRequest {
  /**
   * Amount to transfer
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
   * id of user sending funds
   * @example 1
   */
  @IsNumber()
  @Min(1)
  public readonly userId: number;

  /**
   * id of user receiving funds
   * @example 2
   */
  @IsNumber()
  @Min(1)
  public readonly recipientId: number;
}

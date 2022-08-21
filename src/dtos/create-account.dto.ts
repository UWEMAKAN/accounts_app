import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateAccountRequestDto {
  /**
   * Opening balance for the new account
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
  @IsOptional()
  public readonly openingBalance?: number;

  /**
   * id of the user opening the account
   * @example 1
   */
  @IsInt()
  @Min(1)
  public readonly userId: number;
}

export class CreateAccountResponseDto {
  /**
   * status of the operation
   * @example 201
   */
  @IsInt()
  statusCode: number;

  /**
   * Message describing the state of the operation
   * @example 'Account creation successful'
   */
  @IsString()
  message: string;
}

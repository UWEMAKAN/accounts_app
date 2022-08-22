import {
  IsEmail,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class UserDetailsResponse {
  /**
   * Id of the user
   * @example 1
   */
  @IsInt()
  @Min(1)
  id: number;

  /**
   * First name of the user
   * @example 'Bender'
   */
  @IsString()
  firstName: string;

  /**
   * Last name of the user
   * @example 'Rodriguez'
   */
  @IsString()
  lastName: string;

  /**
   * email address of the user
   * @example 'bender.rodriguez@futura.ma'
   */
  @IsEmail()
  email: string;

  /**
   * Account balance of the user
   * @example 10000
   */
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 2,
  })
  @IsPositive()
  balance: number;
}

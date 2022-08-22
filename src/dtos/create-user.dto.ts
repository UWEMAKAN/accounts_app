import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserRequest {
  /**
   * First name of the user to be created
   * @example 'Bender'
   */
  @IsString()
  @MinLength(2)
  public readonly firstName: string;

  /**
   * Last name of the user to be created
   * @example 'Rodriguez'
   */
  @IsString()
  @MinLength(2)
  public readonly lastName: string;

  /**
   * Valid email address of the user to be created
   * @example 'bender.rodriguez@futura.ma'
   */
  @IsEmail()
  public readonly email: string;

  /**
   * Valid password for the user to be created.
   * @example 'PlanetOmicron'
   */
  @IsString()
  @MinLength(8)
  public readonly password: string;
}

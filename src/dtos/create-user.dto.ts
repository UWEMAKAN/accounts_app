import { IsEmail, IsInt, IsJWT, IsString, MinLength } from 'class-validator';

export class CreateUserRequestDto {
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

export class CreateUserResponseDto {
  /**
   * The id of the newly created user
   * @example 1
   */
  @IsInt()
  userId: number;

  /**
   * Authorization token for accessing protected endpoints
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImJlbmRlckBmdXR1ci5hbWEiLCJmaXJzdE5hbWUiOiJCZW5kZXIiLCJsYXN0TmFtZSI6IlJvZHJpZ3VleiIsImlhdCI6MTUxNjIzOTAyMn0.iE9UIgEhoWZQuHmCFuT1EeQ9Jdo1F-Q7yinqXTfgPeY'
   */
  @IsJWT()
  token: string;
}

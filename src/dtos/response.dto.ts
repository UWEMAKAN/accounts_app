import { IsInt, IsString } from 'class-validator';

export class GeneralResponse {
  /**
   * status of the operation
   * @example 200
   */
  @IsInt()
  statusCode: number;

  /**
   * Message describing the state of the operation
   * @example 'Operation successful'
   */
  @IsString()
  message: string;
}

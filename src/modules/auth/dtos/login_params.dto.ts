import { IsNotEmpty } from 'class-validator';
import { generateValidationMessage } from '@utils/index';

export class LoginParamsDto {
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [email].'),
  })
  email: string;

  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập [password].'),
  })
  password: string;
}

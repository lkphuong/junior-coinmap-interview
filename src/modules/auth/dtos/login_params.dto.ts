import { IsNotEmpty } from 'class-validator';
import { generateValidationMessage } from '@utils/index';
import { EmailValidator } from '@validators/email.validator';
import { LengthValidator } from '@validators/length.validator';

export class LoginParamsDto {
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập email.'),
  })
  @EmailValidator({
    message: (arg) => generateValidationMessage(arg, 'Email không hợp lệ.'),
  })
  email: string;

  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập password.'),
  })
  @LengthValidator(1, 100, {
    message: (arg) =>
      generateValidationMessage(
        arg,
        'Mật khẩu độ dài tối đa độ dài tối đa 100 kí tự.',
      ),
  })
  password: string;
}

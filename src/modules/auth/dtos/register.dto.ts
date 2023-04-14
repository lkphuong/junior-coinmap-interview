import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { generateValidationMessage } from '@utils/index';
import { LengthValidator } from '@validators/length.validator';
import { EmailValidator } from '@validators/email.validator';

export class RegisterDto {
  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập email.'),
  })
  @EmailValidator({
    message: (arg) => generateValidationMessage(arg, 'Email không hợp lệ.'),
  })
  email: string;

  @Transform((params) =>
    params.value ? params.value.toString().trim() : params.value,
  )
  @IsNotEmpty({
    message: (arg) =>
      generateValidationMessage(arg, 'Bạn vui lòng nhập mật khẩu.'),
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

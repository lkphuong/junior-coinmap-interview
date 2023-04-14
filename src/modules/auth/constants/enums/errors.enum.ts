export enum ErrorMessage {
  ACCOUNT_NOT_FOUND_ERROR = 'Tài khoản không tồn tại.',
  INVALID_TOKEN_ERROR = 'Invalid token (access_token: %s)',
  NO_TOKEN_ERROR = 'No token',
  LOGIN_FAILD = 'Tài khoản hoặc mật khẩu không hợp lệ.',

  PASSWORD_NO_MATCHING_ERROR = 'Xác nhận mật khẩu không chính xác.',

  OPERATOR_PASSWORD_ERROR = 'Cập nhật mật khẩu thất bại.',

  EMAIL_DUPLICATE_ERROR = 'Eail đã tồn tại (email: %s).',
  OPERATOR_USER_ERROR = 'Lưu thông tin người dùng thất bại.',
}

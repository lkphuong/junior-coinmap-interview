import { UserEntity } from '@entities/user.entity';
import { RegisterResponse } from '../interfaces/register_response.interface';

export const generate2Object = async (user: UserEntity) => {
  if (user) {
    const payload: RegisterResponse = {
      id: user.id,
      email: user.email,
      active: user.active,
    };

    return payload;
  }
  return null;
};

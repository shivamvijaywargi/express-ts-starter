import User, { IUser } from '@/models/user.model';
import AppErr from '@/utils/AppErr';
import { NextFunction } from 'express';

export const createUser = async (body: IUser, next: NextFunction) => {
  const userExists = await User.findOne({ email: body.email });

  if (userExists) {
    return next(
      new AppErr(
        'The email you entered is already associated with another account',
        409,
      ),
    );
  }

  const newUser = await User.create(body);

  return newUser;
};

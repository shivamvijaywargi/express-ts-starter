import { randomBytes } from 'crypto';

import { RequestHandler } from 'express';

import asyncHandler from '@/middlewares/asyncHandler.middleware';
import User from '@/models/user.model';
import VerifyResetToken from '@/models/verifyResetToken.model';
import AppErr from '@/utils/AppErr';
import sendEmail from '@/utils/sendEmail';
import sendResp from '@/utils/sendResp';
import Logger from '@/utils/logger';

interface ICookieOptions {
  httpOnly: boolean;
  sameSite: boolean | 'lax' | 'strict' | 'none';
  maxAge: number;
  secure?: boolean;
}

const cookieOptions: ICookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  // secure: true, // This does not work in local I believe
};

const CLIENT_URL = process.env.CLIENT_URL;

/**
 * @REGISTER
 * @ROUTE @POST {{URL}}/api/v1/auth/new
 * @returns Sends verification email to user email
 * @ACCESS Public
 */
export const registerUser: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      return next(
        new AppErr(
          'The email you entered is already associated with another account.',
          409,
        ),
      );
    }

    const newUser = await User.create(req.body);

    if (!newUser) {
      return next(
        new AppErr('User could not be registered, please try again.', 500),
      );
    }

    const verificationToken = randomBytes(32).toString('hex');

    const emailVerificationToken = await VerifyResetToken.create({
      _userId: newUser._id,
      token: verificationToken,
    });

    const emailLink = `${CLIENT_URL}/api/v1/auth/verify/${emailVerificationToken.token}/${newUser._id}`;

    const payload = {
      name: newUser.firstName,
      link: emailLink,
    };

    await sendEmail(
      newUser.email,
      'Account Verification',
      payload,
      '../templates/accountVerification.handlebars',
    );

    res
      .status(201)
      .json(sendResp('User registered successfully.', undefined, 201));
  },
);

/**
 * @LOGIN
 * @ROUTE @POST {{URL}}/api/v1/auth
 * @returns Refresh(cookies) + Access token(response) and user
 * @ACCESS Public
 */
export const loginUser: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(
        new AppErr('Invalid email or password or user does not exist.', 400),
      );
    }

    if (!user.isEmailVerified) {
      return next(new AppErr('Account not verified, please verify.', 401));
    }

    if (!user.isActive) {
      return next(
        new AppErr('Your account is deactivated, please contact admin.', 401),
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new AppErr('Invalid email or password.', 401));
    }

    const accessToken = await user.generateAccessToken();
    const newRefreshToken = await user.generateRefreshToken();

    const cookies = req.cookies;

    // creating new refresh token array
    // If no jwtToken in cookies then use user.refreshToken from the DB
    // Else remove the jwtToken from user.refreshToken
    // We are doing this to remove the token from the array so that it cannot be reused
    let newRefreshTokenArray = !cookies?.jwtToken
      ? user.refreshToken
      : user.refreshToken.filter((refT: string) => refT !== cookies.jwtToken);

    if (cookies?.jwtToken) {
      const refreshToken = cookies.jwtToken;

      const existingRefreshToken = await VerifyResetToken.findOne({
        refreshToken,
      }).lean();

      if (!existingRefreshToken) {
        newRefreshTokenArray = [];
      }

      res.clearCookie('jwtToken', cookieOptions);
    }

    user.refreshToken = [...newRefreshTokenArray, newRefreshToken];

    await user.save();

    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };

    res
      .status(200)
      .cookie('jwtToken', newRefreshToken, cookieOptions)
      .json(
        sendResp('User logged in successfully.', userData, 200, accessToken),
      );
  },
);

/**
 * @LOGOUT
 * @ROUTE @POST {{URL}}/api/v1/auth/logout
 * @returns Logged out successfully
 * @ACCESS Public
 */
export const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwtToken) {
    Logger.error('No token found.', 404);
    return res.sendStatus(204);
  }

  const refreshToken = cookies.jwtToken;

  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie('jwtToken', cookieOptions);
    return res.sendStatus(204);
  }

  user.refreshToken = user.refreshToken.filter((refT) => refT !== refreshToken);

  await user.save();

  res.clearCookie('jwtToken', cookieOptions);

  res.status(200).json(sendResp('Logged out successfully.', undefined, 200));
});

/**
 * @VERIFY_USER_EMAIL
 * @ROUTE @GET {{URL}}/api/v1/auth/verify/:token/:userId
 * @returns Email verified successfully
 * @ACCESS Public
 */
export const verifyUserEmail: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { token, userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return next(new AppErr('User not found.', 404));
    }

    if (user.isEmailVerified) {
      return next(
        new AppErr('Your email has already been verified. Please login.', 404),
      );
    }

    const emailVerificationToken = await VerifyResetToken.findOne({
      _userId: user._id,
      token,
    });

    if (!emailVerificationToken) {
      return next(new AppErr('Invalid token or token expired.', 400));
    }

    user.isEmailVerified = true;

    await user.save();

    if (user.isEmailVerified) {
      const emailLink = `${CLIENT_URL}/login`;

      const payload = {
        name: user.firstName,
        link: emailLink,
      };

      await sendEmail(
        user.email,
        'Welcome - Account Verified',
        payload,
        '../template/welcome.handlebars',
      );

      return res.redirect('/auth/verify');
    }
  },
);

/**
 * @RESEND_VERIFY_EMAIL_TOKEN
 * @ROUTE @POST {{URL}}/api/v1/auth/verify/resend
 * @returns Email verification token sent successfully
 * @ACCESS Public
 */
export const resendVerifyEmailToken: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppErr('User not found.', 404));
    }

    if (user.isEmailVerified) {
      return next(
        new AppErr('Your email has already been verified. Please login.', 404),
      );
    }

    // Find if token exists
    const verificationTokenExists = await VerifyResetToken.findOne({
      _userId: user._id,
    });

    // Delete if token exists
    if (verificationTokenExists) {
      await verificationTokenExists.deleteOne();
    }

    const verificationToken = randomBytes(32).toString('hex');

    const emailVerificationToken = await VerifyResetToken.create({
      _userId: user._id,
      token: verificationToken,
    });

    const emailLink = `${CLIENT_URL}/api/v1/auth/verify/${emailVerificationToken.token}/${user._id}`;

    const payload = {
      name: user.firstName,
      link: emailLink,
    };

    await sendEmail(
      user.email,
      'Account Verification',
      payload,
      '../templates/accountVerification.handlebars',
    );

    res
      .status(200)
      .json(sendResp(`Email verification token sent.`, undefined, 200));
  },
);

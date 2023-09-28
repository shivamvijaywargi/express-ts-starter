import { Document, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import ROLES_LIST from '@/constants/ROLES_LIST';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordChangedAt: number;
  role: string;
  isActive: boolean;
  isEmailVerified: boolean;
  loginCount: number;
  refreshToken: string[];
  comparePassword: (password: string) => Promise<boolean>;
  generateAccessToken: () => Promise<string>;
  generateRefreshToken: () => Promise<string>;
  generateGravatar: (size: number) => string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      lowercase: true,
      minlength: [2, 'First name must be atleast 2 characters long'],
      maxlength: [20, 'First name cannot be more than 20 characters'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      lowercase: true,
      minlength: [2, 'Last name must be atleast 2 characters long'],
      maxlength: [20, 'Last name cannot be more than 20 characters'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please fill in a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      unique: true,
      minlength: [10, 'Phone number cannot be less than 10 digits'],
      maxlength: [15, 'Phone number cannot be more than 15 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be atleast 8 characters long'],
      select: false,
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: [ROLES_LIST.SUPER_ADMIN, ROLES_LIST.ADMIN, ROLES_LIST.USER],
      default: ROLES_LIST.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    refreshToken: [String],
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();

  next();
});

userSchema.methods = {
  comparePassword: async function (plainPassword: string) {
    return await bcrypt.compare(plainPassword, this.password);
  },
  generateAccessToken: async function () {
    return jwt.sign(
      { user_id: this._id, role: this.role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      },
    );
  },
  generateRefreshToken: async function () {
    return jwt.sign(
      { user_id: this._id, role: this.role },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      },
    );
  },
  generateGravatar: function gravatar(size) {
    if (!size) {
      size = 200;
    }

    if (!this.email) {
      return `https://gravatar.com/avatar/00000000000000000000000000000000?s=${size}&d=robohash`;
    }

    const md5 = crypto.createHash('md5').update(this.email).digest('hex');

    return `https://gravatar.com/avatar/${md5}?s=${size}&d=robohash`;
  }
};

const User = model<IUser>('User', userSchema);

export default User;

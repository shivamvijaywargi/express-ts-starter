import { Document, Schema, model } from 'mongoose';

export interface IVerifyResetToken extends Document {
  _userId: Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const verifyResetTokenSchema = new Schema<IVerifyResetToken>({
  _userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 900, // This will delete the document after 900 seconds(15 minutes)
  },
});

const VerifyResetToken = model<IVerifyResetToken>(
  'VerifyResetToken',
  verifyResetTokenSchema,
);

export default VerifyResetToken;

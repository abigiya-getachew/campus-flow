import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);

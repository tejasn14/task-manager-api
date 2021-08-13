import mongoose, { model, Model } from "mongoose";
import { NextFunction } from "express";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sharp from "sharp";

import Task from "./task";
import { IUserDocument } from "../interfaces/IUserDocument";

export interface IUser extends IUserDocument {}

export interface IUserModel extends Model<IUser> {
  findByCredentials(email: string, password: string): any;
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      default: 0,
      validate(value: any) {
        if (value < 0) {
          throw new Error("Age must be a positive number");
        }
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value: any) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value: any) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password cannot be password");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject: any = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  const user: any = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET as any
  );

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (
  email: string,
  password: string
) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

// Match plain text password before saving
// @ts-ignore
userSchema.pre("save", async function (next: NextFunction) {
  const user: any = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Delete user tasks if user is deleted
// @ts-ignore
userSchema.pre("remove", async function (next: NextFunction) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

export const User: IUserModel = model<IUser, IUserModel>("User", userSchema);
export default User;

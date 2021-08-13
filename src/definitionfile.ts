import { Request } from "express";
import mongoose from "mongoose";
import { IUser } from "./models/user";

export interface IGetUserAuthInfoRequest extends Request {
  user: IUser;
  token: [token: { type: string; required: boolean }];
}

export interface UserDoc extends mongoose.Document {
  tokens: [];
}

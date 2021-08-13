import { Binary } from "bson";
import { Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  age: number;
  email: string;
  password: string;
  tokens: any[];
  avatar: Binary;
}

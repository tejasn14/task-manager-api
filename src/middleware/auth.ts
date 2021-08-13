import jwt from "jsonwebtoken";
import User from "../models/user";
import { Request, Response, NextFunction } from "express";

const auth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token: any = req.header("Authorization").replace("Bearer ", "");

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as any);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

export = auth;

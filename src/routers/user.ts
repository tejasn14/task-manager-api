import express, { NextFunction, Request, Response } from "express";
import multer from "multer";

import User, { IUser } from "../models/user";
import auth from "../middleware/auth";
import { sendWelcomeEmail, sendCancellationEmail } from "../emails/account";
// import sharp from "sharp";

const router = express.Router();

router.post("/users", async (req: Request, res: Response) => {
  const user: any = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req: Request, res: Response) => {
  try {
    const user: any = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

router.post("/users/logout", auth, async (req: any, res: Response) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token: any) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/logoutAll", auth, async (req: any, res: Response) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, async (req: any, res: Response) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req: any, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid Updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/users/me", auth, async (req: any, res: Response) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(null, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req: any, res: Response) => {
    // const buffer: any = await sharp(req.file.buffer)
    //   .resize(250, 250)
    //   .png()
    //   .toBuffer();
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error: Error, req: any, res: Response, next: NextFunction) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/users/me/avatar", auth, async (req: any, res: Response) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.send(200);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/:id/avatar", async (req: any, res: Response) => {
  try {
    const user: any = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

export = router;

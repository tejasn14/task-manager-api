"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const user_1 = __importDefault(require("../models/user"));
const auth_1 = __importDefault(require("../middleware/auth"));
const account_1 = require("../emails/account");
// import sharp from "sharp";
const router = express_1.default.Router();
router.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new user_1.default(req.body);
    try {
        yield user.save();
        account_1.sendWelcomeEmail(user.email, user.name);
        const token = yield user.generateAuthToken();
        res.status(201).send({ user, token });
    }
    catch (e) {
        res.status(400).send(e);
    }
}));
router.post("/users/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findByCredentials(req.body.email, req.body.password);
        const token = yield user.generateAuthToken();
        res.send({ user, token });
    }
    catch (e) {
        res.status(400).send();
    }
}));
router.post("/users/logout", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        yield req.user.save();
        res.send();
    }
    catch (e) {
        res.status(500).send();
    }
}));
router.post("/users/logoutAll", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.user.tokens = [];
        yield req.user.save();
        res.send();
    }
    catch (e) {
        res.status(500).send();
    }
}));
router.get("/users/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(req.user);
}));
router.patch("/users/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates!" });
    }
    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));
        yield req.user.save();
        res.send(req.user);
    }
    catch (e) {
        res.status(400).send(e);
    }
}));
router.delete("/users/me", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield req.user.remove();
        account_1.sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    }
    catch (e) {
        res.status(500).send();
    }
}));
const upload = multer_1.default({
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
router.post("/users/me/avatar", auth_1.default, upload.single("avatar"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const buffer: any = await sharp(req.file.buffer)
    //   .resize(250, 250)
    //   .png()
    //   .toBuffer();
    req.user.avatar = req.file.buffer;
    yield req.user.save();
    res.send();
}), (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});
router.delete("/users/me/avatar", auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.user.avatar = undefined;
        yield req.user.save();
        res.send(200);
    }
    catch (e) {
        res.status(500).send();
    }
}));
router.get("/users/:id/avatar", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    }
    catch (e) {
        res.status(404).send();
    }
}));
module.exports = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCancellationEmail = exports.sendWelcomeEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendWelcomeEmail = (email, name) => {
    mail_1.default.send({
        to: email,
        from: "tejasn14@gmail.com",
        subject: "Welcome to the App",
        text: `Welcome to the App ${name}. Let me know how you get along with the app.`,
    });
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendCancellationEmail = (email, name) => {
    mail_1.default.send({
        to: email,
        from: "tejasn14@gmail.com",
        subject: "Sorry to see you go",
        text: `Good Bye ${name}. Let us know if there was anything we could have done to have kept you on board.`,
    });
};
exports.sendCancellationEmail = sendCancellationEmail;

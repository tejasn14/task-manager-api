import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as any);

export const sendWelcomeEmail = (email: string, name: string) => {
  sgMail.send({
    to: email,
    from: "tejasn14@gmail.com",
    subject: "Welcome to the App",
    text: `Welcome to the App ${name}. Let me know how you get along with the app.`,
  });
};

export const sendCancellationEmail = (email: string, name: string) => {
  sgMail.send({
    to: email,
    from: "tejasn14@gmail.com",
    subject: "Sorry to see you go",
    text: `Good Bye ${name}. Let us know if there was anything we could have done to have kept you on board.`,
  });
};

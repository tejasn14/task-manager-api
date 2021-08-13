import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URL as any, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

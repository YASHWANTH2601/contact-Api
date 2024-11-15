import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
  const url = process.env.MONGO_URL;
  return mongoose
    .connect(url)
    .then(() => console.log("Data Base connected successfully"))
    .catch((error) => {
      `error : ${error}`;
    });
};

export default connectDb;

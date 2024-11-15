import express from "express";
import connectDb from "./config/db.js";
const app = express();
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import auth from "./routes/auth.js";
import contact from "./routes/contact.js";
app.use(express.json());
app.use(cors());

app.use("/api", auth);
app.use("/api", contact);
app.get("/api", (req, res) => {
  res.send("hello world");
});
// routes

const PORT = process.env.PORT || 4000;
const connectFirst = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`server is running ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

connectFirst();

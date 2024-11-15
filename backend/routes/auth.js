import express from "express";
const router = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middlewares/auth.js";
router.post("/register", async (req, res) => {
  const { name, password, email } = req.body;
  if (!name || !password || !email) {
    res.status(400).json({ message: "please enter all fields" });
  }
  if (name.length > 25) {
    res
      .status(400)
      .json({ message: "name is should be less than 25 characters" });
  }
  const emailReg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailReg.test(email)) {
    res.status(400).json({ message: "please enter valid email" });
  }
  if (password.length < 6) {
    res
      .status(400)
      .json({ message: "password should be greater than 6 characters" });
  }
  try {
    const doesUserAlreadyExist = await User.findOne({ email });
    if (doesUserAlreadyExist) {
      res
        .status(400)
        .json({ error: `a user with this email${email} already exists` });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ name, email, password: hashedPassword });
    const result = await newUser.save();
    result._doc.password = undefined;

    return res.status(201).json("succefully Created");
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "please enter all fields" });
  }
  const emailReg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailReg.test(email)) {
    res.status(400).json({ message: "please enter valid email" });
  }
  try {
    const doesUserAlreadyExist = await User.findOne({ email });
    const doesPasswordMatch = await bcrypt.compare(
      password,
      doesUserAlreadyExist.password
    );
    if (!doesPasswordMatch)
      return res.status(400).json({ error: "Invalid email or password!" });
    const payload = {
      _id: doesUserAlreadyExist._id,
      email: doesUserAlreadyExist.email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const user = {
      _id: doesUserAlreadyExist._doc,
      password: undefined,
    };
    return res.status(200).json({ token, user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

router.get("/me", auth, async (req, res) => {
  return res.status(200).json({ ...req.user._doc });
});

export default router;

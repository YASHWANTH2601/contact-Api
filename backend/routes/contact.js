import express from "express";
const router = express.Router();
import { Contact, validateContact } from "../models/Contact.js";
import auth from "../middlewares/auth.js";
import mongoose from "mongoose";

router.post("/contact", auth, async (req, res) => {
  const { error } = validateContact(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { name, address, phone, email } = req.body;
  try {
    const newContact = new Contact({
      name,
      address,
      phone,
      email,
      postedBy: req.user._id,
    });
    const result = await newContact.save();
    return res.status(201).json({ ...result._doc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/mycontacts", auth, async (req, res) => {
  try {
    const mycontacts = await Contact.find({ postedBy: req.user._id });
    return res.status(201).json({ mycontacts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.put("/contact", auth, async (res, req) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "no id specified" });
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });
  try {
    const contact = await Contact.findOne({ _id: id });
    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't edit other people contacts" });
    const updatedData = { ...req.body, id: undefined };
    const result = await Contact.findByIdAndUpdated(id, updatedData, {
      new: true,
    });
    return res.status(200).json({ ...result._id });
  } catch (error) {
    console.log(err);
    return res.status(500).json({ error: error.message });
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });
  try {
    const contact = await Contact.findOne({ _id: id });
    if (!contact) return res.status(400).json({ error: "no contact found" });

    if (req.user._id.toString() !== contact.postedBy._id.toString())
      return res
        .status(401)
        .json({ error: "you can't delete other people contacts!" });

    const result = await Contact.deleteOne({ _id: id });
    const myContacts = await Contact.find({ postedBy: req.user._id }).populate(
      "postedBy",
      "-password"
    );

    return res
      .status(200)
      .json({ ...contact._doc, myContacts: myContacts.reverse() });
  } catch (err) {
    console.log(err);
  }
});

// to get a single contact.
router.get("/contact/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "no id specified." });

  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "please enter a valid id" });

  try {
    const contact = await Contact.findOne({ _id: id });

    return res.status(200).json({ ...contact._doc });
  } catch (err) {
    console.log(err);
  }
});

export default router;

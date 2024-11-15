import mongoose from "mongoose";
import Joi from "joi";
const ContactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      requied: [true, "name is required."],
    },
    email: {
      type: String,
      required: [true, "email is required."],
    },
    address: {
      type: String,
      required: [true, "address is required."],
    },
    phone: {
      type: Number,
      required: [true, "phone number is required."],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Contact = new mongoose.model("Contact", ContactSchema);
const validateContact = (contact) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    address: Joi.string().min(4).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.number().required(),
  });
  return schema.validate(contact);
};

export { Contact, validateContact };

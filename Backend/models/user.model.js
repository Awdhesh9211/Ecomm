import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const { Schema, model } = mongoose;

// ---------------------USER SCHEMA------------------------------------------------------------
//                        FIELD-> name
//                        FIELD-> email
//                        FIELD-> password
//                        FIELD-> avatar
//                        FIELD-> role
//                        FIELD-> resetpasswordToken
//                        FIELD-> resetPasswordExpire
//                        FIELD-> createdAt

// ---------------------USER SCHEMA Methode
//                     f-> userSchema.pre()
//                     f-> userSchema.methods.updatePassword
//                     f-> userSchema.methods.getJWTToken
//                     f-> userSchema.methods.comparePassword
//                     f-> userSchema.methods.getResetPasswordToken

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minLength: [2, "Name should have more than 2 charachter"],
    maxLength: [30, "name cannot exceed  30 charachter"],
  },

  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
    validate: [validator.isEmail, "Enter a valid Email"],
  },

  password: {
    type: String,
    required: [true, "password is required"],
    maxLength: [30, "Name cannot exceed 30 charachter"],
    minLength: [2, "name should have more than 2 charachter"],
    select: false,
  },

  avatar: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },

  role: { type: String, default: "user" },

  createdAt: { type: Date, default: Date.now },

  resetPasswordToken: String,

  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// update password
userSchema.methods.updatePassword = async function (pass) {
  this.password = await bcrypt.hash(pass, 10);
};

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetToken =  async function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = model("user", userSchema);

export default User;

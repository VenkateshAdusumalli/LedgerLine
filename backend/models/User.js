const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLE_VALUES, DEFAULT_ROLE } = require("../config/roles");
const { EMAIL_REGEX } = require("../utils/validation");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long."],
      maxlength: [80, "Name must be 80 characters or fewer."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Email format is invalid."],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      maxlength: [72, "Password must be 72 characters or fewer."],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ROLE_VALUES,
        message: "Role must be ADMIN, ACCOUNT_HOLDER, or AUDITOR.",
      },
      default: DEFAULT_ROLE,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete returnedObject.password;
    delete returnedObject.__v;
    return returnedObject;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

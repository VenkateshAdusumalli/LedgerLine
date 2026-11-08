require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const { ROLES } = require("../config/roles");
const {
  normalizeEmail,
  isValidEmail,
  getNameError,
  getPasswordError,
} = require("../utils/validation");

const createAdmin = async () => {
  const name = (process.env.ADMIN_NAME || "").trim();
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD || "";

  if (!name || !email || !password) {
    console.error(
      "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required."
    );
    process.exitCode = 1;
    return;
  }

  const nameError = getNameError(name);
  if (nameError) {
    console.error(`ADMIN_NAME is invalid. ${nameError}`);
    process.exitCode = 1;
    return;
  }

  if (!isValidEmail(email)) {
    console.error("ADMIN_EMAIL is not a valid email address.");
    process.exitCode = 1;
    return;
  }

  const passwordError = getPasswordError(password);
  if (passwordError) {
    console.error(passwordError);
    process.exitCode = 1;
    return;
  }

  await connectDB();

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.error(
        "An account with this email already exists. Administrator was not created."
      );
      process.exitCode = 1;
      return;
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: ROLES.ADMIN,
    });

    console.log(`Administrator created successfully: ${admin.email}`);
  } catch (error) {
    console.error("Unable to create administrator:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin().catch((error) => {
  console.error("Unable to create administrator:", error.message);
  process.exit(1);
});

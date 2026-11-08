const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { DEFAULT_ROLE } = require("../config/roles");
const {
  normalizeEmail,
  isValidEmail,
  getNameError,
  getPasswordError,
} = require("../utils/validation");

const createToken = (userId) => {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

const register = async (req, res) => {
  const body = req.body || {};
  const { name, email, password } = body;

  try {
    if (Object.prototype.hasOwnProperty.call(body, "role")) {
      return res.status(400).json({
        success: false,
        message: "Role cannot be assigned during registration.",
      });
    }

    const nameError = getNameError(name);
    if (nameError) {
      return res.status(400).json({ success: false, message: nameError });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "A valid email address is required.",
      });
    }

    const passwordError = getPasswordError(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: DEFAULT_ROLE,
    });

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      user: user.toJSON(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    if (error.name === "ValidationError") {
      const message =
        Object.values(error.errors)[0]?.message || "Invalid registration data.";

      return res.status(400).json({ success: false, message });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to register account.",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  try {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user._id);
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
};

const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user.toJSON(),
  });
};

module.exports = { register, login, getMe };

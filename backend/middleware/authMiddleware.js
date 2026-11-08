const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is required.",
    });
  }

  const bearerMatch = /^Bearer\s+(.+)$/i.exec(authHeader.trim());

  if (!bearerMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header format.",
    });
  }

  try {
    const decoded = jwt.verify(bearerMatch[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    return next();
  };
};

module.exports = { protect, authorize };

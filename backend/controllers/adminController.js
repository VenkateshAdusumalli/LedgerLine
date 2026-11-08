const mongoose = require("mongoose");
const User = require("../models/User");
const { ROLE_VALUES, ROLES } = require("../config/roles");

const listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);

    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map((user) => user.toJSON()),
    });
  } catch (error) {
    console.error("List users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users.",
    });
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};

  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    if (!ROLE_VALUES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be ADMIN, ACCOUNT_HOLDER, or AUDITOR.",
      });
    }

    if (id === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
      const adminCount = await User.countDocuments({ role: ROLES.ADMIN });

      if (adminCount <= 1) {
        return res.status(409).json({
          success: false,
          message: "At least one administrator account must remain.",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      user: updatedUser.toJSON(),
    });
  } catch (error) {
    console.error("Update user role error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user role.",
    });
  }
};

module.exports = { listUsers, updateUserRole };

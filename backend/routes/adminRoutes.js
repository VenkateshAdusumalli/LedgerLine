const express = require("express");
const {
  listUsers,
  updateUserRole,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");
const { ROLES } = require("../config/roles");

const router = express.Router();

router.use(protect, authorize(ROLES.ADMIN));

router.get("/users", listUsers);
router.patch("/users/:id/role", updateUserRole);

module.exports = router;

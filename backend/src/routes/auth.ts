import express from "express";
import {
  refreshToken,
  changePassword,
  resetPassword,
  verifyResetToken,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  resetPasswordValidation,
} from "../controllers/authController";
import { register, login } from "../controllers/authController";
import { auth, authorize, require2FA } from "../middleware/auth";
import { validate } from "../middleware/validation";

const router = express.Router();

// Public routes
router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.post("/refresh-token", refreshToken);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword
);
router.get("/verify-reset-token/:token", verifyResetToken);

// Protected routes
router.post(
  "/change-password",
  auth,
  require2FA,
  validate(changePasswordValidation),
  changePassword
);

// Admin routes
router.get("/admin/users", auth, authorize("admin"), require2FA, (req, res) => {
  // TODO: Implement get all users
  res.json({ message: "Get all users" });
});

router.post(
  "/admin/users/:userId/block",
  auth,
  authorize("admin"),
  require2FA,
  (req, res) => {
    // TODO: Implement block user
    res.json({ message: "Block user" });
  }
);

router.post(
  "/admin/users/:userId/unblock",
  auth,
  authorize("admin"),
  require2FA,
  (req, res) => {
    // TODO: Implement unblock user
    res.json({ message: "Unblock user" });
  }
);

export default router;

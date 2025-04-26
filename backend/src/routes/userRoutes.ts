import express from "express";
import {
  register,
  getProfile,
  updateProfile,
  updateSubscription,
  deleteAccount,
  getConfessionLink,
  getProfileByLink,
  getUserStats,
  getMessageCount,
} from "../controllers/userController";
import { auth } from "../middleware/auth";
import { userValidation } from "../middleware/validation";

const router = express.Router();

// Public routes
router.post("/register", userValidation, register);
// router.post("/login", login);
router.get("/confession-link/:username", getConfessionLink);
router.get("/profile/:confessionLink", getProfileByLink);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, userValidation, updateProfile);
router.put("/subscription", auth, updateSubscription);
router.delete("/account", auth, deleteAccount);
router.get("/stats", auth, getUserStats);
router.get("/message-count", auth, getMessageCount);

export default router;

import express from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import syncUser from "../middleware/user.middleware.js";

const router = express.Router();

/*
  GET /api/auth/me

  Returns the currently authenticated user.
*/
router.get(
  "/me",
  requireAuth,
  syncUser,
  (req, res) => {
    res.status(200).json({
      success: true,
      data: req.user
    });
  }
);

export default router;
import express from "express";
import { authController } from "../controllers/auth.controller";
const router = express.Router();

router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/record-refresh-token", authController.getRecordRefreshToken);
router.delete("/delete-all-refresh-token", authController.deleteAllRefreshToken);
router.get("/all-refresh-token", authController.getAllRefreshToken);

export const authRouter = router;
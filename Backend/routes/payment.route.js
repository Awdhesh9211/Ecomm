import express from "express";
import {
  processPayment,
  sendStripeApiKey,
} from "../controllers/payment.controller.js";
const router = express.Router();
import { isAuthenticatedUser } from "../middleware/auth.js";



// Routers

router.route("/payment/process").post(isAuthenticatedUser, processPayment);

router.route("/stripeapikey").get(isAuthenticatedUser, sendStripeApiKey);

export default router;
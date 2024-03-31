import express from "express";
import {
  newOrder,
  getSingleOrder,
  userOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller.js";
const router = express.Router();

import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

// Routers

router.route("/order/new").post(isAuthenticatedUser, newOrder);

router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, userOrders);

router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

  export default router;

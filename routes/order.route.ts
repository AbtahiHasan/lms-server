import express from "express"
import orderController from "../controller/order.controller"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"

const orderRouter = express.Router()

orderRouter.post("/create-order", isAuthenticated, orderController.createOrder)
orderRouter.get("/get-all-orders", isAuthenticated, authorizeRoles("admin"), orderController.getAllOrders)

export default orderRouter
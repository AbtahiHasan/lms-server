import express from "express"
import orderController from "../controller/order.controller"
import { isAuthenticated } from "../middleware/auth"

const orderRouter = express.Router()

orderRouter.post("/create-order", isAuthenticated, orderController.createOrder)

export default orderRouter
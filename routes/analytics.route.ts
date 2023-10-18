import express from "express"
import analyticsController from "../controller/analytics.controller"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"

const analyticsRouter = express.Router()

analyticsRouter.get("/get-user-analytics", isAuthenticated, authorizeRoles("admin"), analyticsController.getUserAnalytics)
analyticsRouter.get("/get-order-analytics", isAuthenticated, authorizeRoles("admin"), analyticsController.getOrderAnalytics)
analyticsRouter.get("/get-course-analytics", isAuthenticated, authorizeRoles("admin"), analyticsController.getCourseAnalytics)


export default analyticsRouter
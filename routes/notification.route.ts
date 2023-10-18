import express from "express"
import notificationController from "../controller/notification.controller"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"

const notificationRouter = express.Router()


notificationRouter.get("/get-all-notifications", isAuthenticated, authorizeRoles("admin"), notificationController.getAllNotifications)
notificationRouter.put("/update-notification-status/:id", isAuthenticated, authorizeRoles("admin"), notificationController.updateNotificationStatus)

export default notificationRouter
import { NextFunction, Request, Response } from "express"
import cron from "node-cron"
import catchAsyncError from "../middleware/catchAsyncError"
import ErrorHandler from "../utils/ErrorHandler"
import notificationModel from "../models/notification.model"

const getAllNotifications = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notifications = await notificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
const updateNotificationStatus = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params?.id
        const notification = await notificationModel.findById(id)

        if (!notification) {
            return next(new ErrorHandler("Notification not found", 404))
        } else {
            notification.status ? notification.status = "read" : notification.status
        }

        await notification.save()

        const notifications = await notificationModel.find().sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notifications
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})



const notificationController = {
    getAllNotifications,
    // updateNotificationStatus
}

export default notificationController
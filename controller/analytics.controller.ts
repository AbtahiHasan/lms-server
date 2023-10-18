import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import userModel from "../models/user.model";
import orderModel from "../models/order.model";
import courseModel from "../models/course.model";

const getUserAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await generateLast12MonthsData(userModel)
        res.status(200).json({
            success: true,
            user
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
const getOrderAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const order = await generateLast12MonthsData(orderModel)
        res.status(200).json({
            success: true,
            order
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
const getCourseAnalytics = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await generateLast12MonthsData(courseModel)
        res.status(200).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

const analyticsController = {
    getUserAnalytics,
    getOrderAnalytics,
    getCourseAnalytics
}

export default analyticsController
import { NextFunction, Response } from "express";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import courseModel from "../models/course.model";

export const createCourse = catchAsyncError(async (data: any, res: Response, next: NextFunction) => {
    try {
        const course = await courseModel.create(data)
        res.status(200).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
})
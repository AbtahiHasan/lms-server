import { NextFunction, Request, Response } from "express"
import catchAsyncError from "../middleware/catchAsyncError"
import ErrorHandler from "../utils/ErrorHandler"
import { createCourse } from "../services/course.service"
import courseModel from "../models/course.model"


const uploadCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        createCourse(data, res, next)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
const editCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const courseId = req.params.id

        const course = await courseModel.findByIdAndUpdate(courseId, { $set: data }, {
            new: true
        })
        await course?.save()

        res.status(201).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})



const courseController = {
    uploadCourse,
    editCourse
}

export default courseController
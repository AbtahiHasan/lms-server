import { NextFunction, Request, Response } from "express"
import catchAsyncError from "../middleware/catchAsyncError"
import ErrorHandler from "../utils/ErrorHandler"
import { createCourse } from "../services/course.service"
import courseModel from "../models/course.model"
import { v2 as cloudinary } from "cloudinary"


const uploadCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        if (data?.thumbnail) {
            const myCloud = await cloudinary.uploader.upload(data?.thumbnail, {
                folder: "courses"
            })

            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }

        }
        createCourse(data, res, next)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
const editCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body
        const courseId = req.params.id
        if (data?.thumbnail) {
            await cloudinary.uploader.destroy(data?.thumbnail?.public_id)
            const myCloud = await cloudinary.uploader.upload(data?.thumbnail, {
                folder: "courses"
            })
            data.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            }

        }
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
import { NextFunction, Request, Response } from "express"
import catchAsyncError from "../middleware/catchAsyncError"
import ErrorHandler from "../utils/ErrorHandler"
import { createCourse } from "../services/course.service"
import courseModel from "../models/course.model"
import { v2 as cloudinary } from "cloudinary"
import redis from "../utils/redis"


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

const getSingleCourse = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params?.id
        const isCacheExits = await redis.get(courseId)
        if (isCacheExits) {
            const course = JSON.parse(isCacheExits)
            console.log("hitting redis")
            res.status(200).json({
                success: true,
                course
            })
        }
        else {
            const course = await courseModel.findById(courseId).select("-course_data.video_url -course_data.video_section -course_data.links -course_data.suggestion -course_data.questions")
            console.log("hitting mongodb")
            await redis.set(courseId, JSON.stringify(course))
            res.status(200).json({
                success: true,
                course
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
const getCourses = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {

        const isCacheExits = await redis.get("all-courses")
        if (isCacheExits) {
            const course = JSON.parse(isCacheExits)
            console.log("hitting redis")
            res.status(200).json({
                success: true,
                course
            })
        }
        else {
            const course = await courseModel.find().select("-course_data.video_url -course_data.video_section -course_data.links -course_data.suggestion -course_data.questions")
            console.log("hitting mongodb")
            await redis.set("all-courses", JSON.stringify(course))
            res.status(200).json({
                success: true,
                course
            })
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})



const courseController = {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getCourses
}

export default courseController
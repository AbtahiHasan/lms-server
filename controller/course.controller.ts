import { NextFunction, Request, Response } from "express"
import catchAsyncError from "../middleware/catchAsyncError"
import ErrorHandler from "../utils/ErrorHandler"
import { createCourse } from "../services/course.service"
import courseModel from "../models/course.model"
import { v2 as cloudinary } from "cloudinary"
import redis from "../utils/redis"
import mongoose from "mongoose"


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
            res.status(200).json({
                success: true,
                course
            })
        }
        else {
            const course = await courseModel.findById(courseId).select("-course_data.video_url -course_data.video_section -course_data.links -course_data.suggestion -course_data.questions")
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

            res.status(200).json({
                success: true,
                course
            })
        }
        else {
            const course = await courseModel.find().select("-course_data.video_url -course_data.video_section -course_data.links -course_data.suggestion -course_data.questions")

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
const getCourseByUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = req.params?.id
        const userCouseList = req.user?.courses

        const isCourseExits = userCouseList?.find(course => course.course_id === courseId)
        if (isCourseExits) {
            const course = await courseModel.findById(courseId).select("-course_data.video_url -course_data.video_section -course_data.links -course_data.suggestion -course_data.questions")
            return res.status(200).json({
                success: true,
                course
            })
        }

        res.status(400).json({
            success: false,
            message: "your are not eligible for this course"
        })



    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IQuestionReq {
    contentId: string;
    courseId: string;
    question: string;
}

const addQuestion = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { contentId, courseId, question } = req.body as IQuestionReq
        const course = await courseModel.findById(courseId)

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("invalid content id", 400))
        }

        const courseContent = course?.course_data?.find((item: any) => item._id.toString() === contentId)

        if (!courseContent) {
            return next(new ErrorHandler("invalid content id", 400))
        }

        const newQuestion: any = {
            user: req.user,
            question,
            questionReplies: []
        }
        courseContent?.questions?.push(newQuestion)

        await course?.save()

        res.status(200).json({
            success: true,
            course
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IQuestionResply {
    contentId: string;
    courseId: string;
    questionId: string;
    question: string;

}


const addQuestionReply = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { contentId, courseId, questionId, question: questionData } = req.body as IQuestionResply
        const course = await courseModel.findById(courseId)

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("invalid content id", 400))
        }

        const courseContent = course?.course_data?.find((item: any) => item._id.toString() === contentId)

        if (!courseContent) {
            return next(new ErrorHandler("invalid content id", 400))
        }

        const question = courseContent.questions.find((item: any) => item._id.toString() === questionId)

        if (!question) {
            return next(new ErrorHandler("invalid question id", 400))
        }

        const questionReply: any = {
            user: req.user,
            questionData
        }
        question.questionReplies.push(questionReply)

        await course?.save()

        if (req.user?._id === question.user._id) {
            //TODO create Notification 
        } else {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            }
        }

        res.status(200).json({
            success: true,
            course
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

const courseController = {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getCourses,
    getCourseByUser,
    addQuestion,
    addQuestionReply
}

export default courseController
import {
    StatusCodes,
} from 'http-status-codes';
import crypto from "crypto"
import ejs from "ejs"
import path from 'path'
import { NextFunction, Request, Response } from "express";
import orderModel, { IOrder } from "../models/order.model"
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from '../models/user.model';
import courseModel from '../models/course.model';
import { addOrder } from '../services/order.service';
import sendMail from '../utils/sendMail';
import notificationModel from '../models/notification.model';


const createOrder = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { courseId, payment_info } = req.body as any
        const user = await userModel.findById(req.user?._id)
        const courseExitsInUser = user?.courses.find(item => item.course_id.toString() === courseId)
        if (courseExitsInUser) {
            return next(new ErrorHandler("you have already purchased this course", StatusCodes.BAD_REQUEST))
        }

        const course = await courseModel.findById(courseId)
        if (!course) {
            return next(new ErrorHandler("Course not found", StatusCodes.BAD_REQUEST))
        }

        const data: any = {
            order_id: course._id,
            user_id: req.user?._id,
            payment_info
        }

        const mailData: any = {
            order: {
                _id: crypto.randomUUID(),
                course_name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            }
        }

        await ejs.renderFile(path.join(__dirname, "../mails/order-confirmation.ejs"), mailData)
        if (user) {
            sendMail({
                email: user?.email,
                subject: "Order confirmation",
                templete: "order-confirmation.ejs",
                data: mailData
            })
            user.courses.push({ course_id: course._id })
            await user?.save()

            const notification = {
                user: user?._id,
                title: "New Order",
                message: `You have a new order from ${course?.name}`
            }

            await notificationModel.create(notification)

            course.purchased = course?.purchased ? course?.purchased + 1 : 1

            await course.save()

        }

        addOrder(data, res, next)

    } catch (error: any) {
        return next(new ErrorHandler(error.message, StatusCodes.BAD_REQUEST))
    }
})

const orderController = {
    createOrder
}

export default orderController
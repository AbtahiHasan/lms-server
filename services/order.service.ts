import { NextFunction, Request, Response } from "express";
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import orderModel from "../models/order.model";

export const addOrder = catchAsyncError(async (data: any, res: Response, next: NextFunction) => {
    try {
        const order = await orderModel.create(data)
        res.status(201).json({
            success: true,
            order
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})
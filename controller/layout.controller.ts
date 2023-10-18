import { NextFunction, Request, Response } from "express";
import { v2 as cloudinary } from 'cloudinary'
import catchAsyncError from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import layoutModel from "../models/layout.model";

const createLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body as any
        const typeAlredyExits = await layoutModel.findOne({ type })
        if (typeAlredyExits) {
            return next(new ErrorHandler(`${type} alredy exits`, 400))
        }

        if (type === "FAQ") {
            const { faq } = req.body as any
            await layoutModel.create({ type: "FAQ", faq })
        }
        else if (type === "CATEGORY") {
            const { categories } = req.body as any

            await layoutModel.create({ type: "CATEGORY", categories })
        }
        else if (type === "BANNER") {
            const { title, image, subtitle } = req.body as any
            const myCloud = await cloudinary.uploader.upload(image, {
                folder: "layout"
            })

            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subtitle
            }

            await layoutModel.create({ type: "BANNER", banner })
        }
        else {
            return next(new ErrorHandler(`${type} is not valid type`, 400))
        }
        res.status(201).json({
            success: true,
            message: "Layout added successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

const updateLayout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type } = req.body as any

        const layout = await layoutModel.findOne({ type })
        if (!layout) {
            return next(new ErrorHandler(`${type} is not valid type`, 400))
        }

        if (type === "FAQ") {
            const { faq } = req.body as any
            await layoutModel.findByIdAndUpdate(layout._id, { faq })
        }
        else if (type === "CATEGORY") {
            const { categories } = req.body as any

            await layoutModel.findByIdAndUpdate(layout._id, { categories })
        }
        else if (type === "BANNER") {
            const { title, image, subtitle } = req.body as any
            await cloudinary.uploader.destroy(layout.banner.image.public_id)
            const myCloud = await cloudinary.uploader.upload(image, {
                folder: "layout"
            })

            const banner = {
                image: {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
                title,
                subtitle
            }

            await layoutModel.findByIdAndUpdate(layout._id, { banner })
        }
        else {
            return next(new ErrorHandler(`${type} is not valid type`, 400))
        }
        res.status(201).json({
            success: true,
            message: "Layout edited successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

const layoutController = {
    createLayout,
    updateLayout
}

export default layoutController
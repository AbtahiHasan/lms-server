import { Request, Response, NextFunction } from "express"
import ErrorHandler from "../utils/ErrorHandler"

const error = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"


    if (err.name === "CastError") {
        const message = `Resourse not found invalid ${err.path}`
        new ErrorHandler(message, 400)
    }
    if (err.code === 11000) {
        const message = `Dublicate object keys ${Object.keys(err.keyValue)} entered`
        new ErrorHandler(message, 400)
    }
    if (err.name === "JsonWebTokenError") {
        const message = `Json web token is invalid, try again`
        new ErrorHandler(message, 400)
    }
    if (err.name === "TokenExpiredError") {
        const message = `json web token is expired, try again`
        new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}

export default error
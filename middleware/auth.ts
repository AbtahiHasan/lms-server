require("dotenv").config()
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
import catchAsyncError from "./catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import redis from "../utils/redis";

export const isAuthenticated = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies?.access_token as string

    if (!access_token) {
        return next(new ErrorHandler("Please login", 401))
    }

    const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload
    if (!decoded) {
        return next(new ErrorHandler("access token is not valid", 401))
    }

    const user = await redis.get(decoded.id)

    if (!user) {
        return next(new ErrorHandler("user not found", 401))
    }

    req.user = JSON.parse(user)
    next()
})


export const authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (roles.includes(req.user?.role || "")) {
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed`, 401))
        }
        next()
    }
}

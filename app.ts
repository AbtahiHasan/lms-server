require("dotenv").config()
import express, { Application, NextFunction, Request, Response } from "express"
import cookieParser from "cookie-parser"
import error from "./middleware/error"
export const app: Application = express()
import cors from "cors"
import userRouter from "./routes/user.route"
import courseRouter from "./routes/course.route"
import orderRouter from "./routes/order.route"
import notificationRouter from "./routes/notification.route"
import analyticsRouter from "./routes/analytics.route"
import layoutRouter from "./routes/layout.route"

app.use(express.json({ limit: "50mb" }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.ORIGIN
}))


// routes 

app.use("/api/v1/", userRouter, courseRouter, orderRouter, notificationRouter, analyticsRouter, layoutRouter)


app.get("/test", (req: Request, res: Response) => {
    res.json({
        success: true,
        message: "Api is working"
    })
})

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any
    err.statusCode = 404
    next(err)
})

app.use(error)

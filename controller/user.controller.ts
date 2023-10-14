require("dotenv").config()
import ejs from "ejs"
import sendMail from "../utils/sendMail"
import path from "path"
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import ErrorHandler from "../utils/ErrorHandler"
import catchAsyncError from "../middleware/catchAsyncError"
import userModel, { IUser } from "../models/user.model"
import createActivationToken from "../utils/createActivationToken"

interface IRegistrationUser {
    name: string;
    email: string,
    password: string;
    avater?: string;
}

const registrationUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body

        const userExits = await userModel.findOne({ email })

        if (userExits) {
            return next(new ErrorHandler("this user already Exits", 400))
        }

        const user: IRegistrationUser = {
            name,
            email,
            password,

        }

        const activationToken = createActivationToken(user)
        const data = { user: { name: user.name }, activationCode: activationToken.activationCode }
        const html = await ejs.renderFile(path.join(__dirname, "./../mails/activation-mail.ejs"), data)

        try {
            await sendMail({
                email: user.email,
                subject: "activate your account",
                templete: "activation-mail.ejs",
                data
            })

            res.json({
                success: true,
                message: `plase check your email ${user.email} to activate your account`,
                activationToken: activationToken.token
            })
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IActivationRequest {
    activationToken: string;
    activationCode: string;
}


const activateUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { activationToken, activationCode } = req.body as IActivationRequest
        const { user, activationCode: tokenActivationCode } = jwt.verify(activationToken, process.env.ACTIVATION_SECRET as string) as {
            user: IUser,
            activationCode: string
        }

        const userExits = await userModel.findOne({ email: user.email })
        console.log(user)
        if (userExits) {
            return next(new ErrorHandler("user alredy exits", 400))
        }

        if (tokenActivationCode !== activationCode) {
            return next(new ErrorHandler("invalid activation code", 400))
        }
        await userModel.create({
            name: user.name,
            email: user.email,
            password: user.password,
        })

        res.json({
            success: true,
        })
    } catch (error: any) {
        console.log(error.message)
    }
})


interface ILoginRequest {
    email: string;
    password: string;
}

const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body as ILoginRequest
        if (!email || !password) {
            return next(new ErrorHandler("plase enter email and password", 400))
        }

        const user = await userModel.findOne({ email }).select("+password")


        if (!user) {
            return next(new ErrorHandler("Invalid email and password", 400))
        }

        const isPasswordMatch = await user.comparePassword(password)

        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid email and password", 400))
        }


        console.log(user)

        res.send(user)
    } catch (error: any) {
        console.log(error.message)
    }
})

const userController = {
    registrationUser,
    activateUser,
    loginUser
}

export default userController
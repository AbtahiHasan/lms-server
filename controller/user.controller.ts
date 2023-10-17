require("dotenv").config()
import ejs from "ejs"
import path from "path"
import { Request, Response, NextFunction } from "express"
import { v2 as cloudinary } from "cloudinary"
import jwt, { JwtPayload } from "jsonwebtoken"
import sendMail from "../utils/sendMail"
import ErrorHandler from "../utils/ErrorHandler"
import catchAsyncError from "../middleware/catchAsyncError"
import userModel, { IUser } from "../models/user.model"
import createActivationToken from "../utils/createActivationToken"
import sendToken, { accessTokenOption, refreshTokenOption } from "../utils/jwt"
import redis from "../utils/redis"
import { getUserById } from "../services/user.service"

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
        return next(new ErrorHandler(error.message, 400))
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

        sendToken(user, 200, res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

const logout = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.cookie("access_token", "", { maxAge: 1 })
        res.cookie("refresh_token", "", { maxAge: 1 })
        redis.del(req.user?._id)
        res.status(200).json({
            success: true,
            message: "logout successfully"
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

const getUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.user?._id
        getUserById(id, res)
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
})

const updateAccessToken = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.cookies?.refresh_token as string
        const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload
        const message = "could not get refresh token"
        if (!decoded) {
            return next(new ErrorHandler(message, 400))
        }

        const session = await redis.get(decoded?.id as string)
        if (!session) {
            return next(new ErrorHandler(message, 400))
        }

        const user = JSON.parse(session)
        const new_access_token = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET as string, {
            expiresIn: "5m"
        })
        const new_refresh_token = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET as string, {
            expiresIn: "3d"
        })

        req.user = user

        res.cookie("access_token", new_access_token, accessTokenOption)
        res.cookie("refresh_token", new_refresh_token, refreshTokenOption)
        res.status(200).json({
            success: true,
            new_access_token
        })

    }
    catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
})

interface ISocailReqBody {
    name: string;
    email: string;
    avater: string
}

const socialAuth = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, avater } = req.body as ISocailReqBody
        const user = await userModel.findOne({ email })
        if (!user) {
            const newUser = await userModel.create({ name, email, avater })
            sendToken(newUser, 200, res)
        } else {
            sendToken(user, 200, res)
        }
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
})

interface IUpdateUserInfo {
    name: string;
    email: string;
}

const updateUserInfo = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body as IUpdateUserInfo
        const userId = req.user?._id
        const user = await userModel.findById(userId)
        if (email && user) {
            const isEmailExits = await userModel.findOne({ email })
            if (isEmailExits) {
                return next(new ErrorHandler("This email already exits", 400))
            }
            user.email = email
        }
        if (name && user) {
            user.name = name
        }

        await redis.set(userId, JSON.stringify(user))
        await user?.save()


        res.status(201).json({
            success: true,
            user
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))

    }
})

interface IChangePassword {
    old_password: string;
    new_password: string;
}

const changePassword = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { old_password, new_password } = req.body as IChangePassword
        const userId = req.user?._id
        if (!old_password || !new_password) {
            return next(new ErrorHandler("please enter old and new password", 400))
        }

        const user = await userModel.findById(userId).select("+password")
        if (!user) {
            return next(new ErrorHandler("invalid user", 400))
        }
        const isPasswordMatch = await user?.comparePassword(old_password)

        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid password", 400))
        }

        user.password = new_password

        await redis.set(userId, JSON.stringify(user))

        await user.save()
        res.status(201).json({
            success: true,
            user
        })

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

interface IChangeAvater {
    avater: string;
}

const changeAvater = catchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { avater } = req.body as IChangeAvater

        const userId = req.user?._id
        const user = await userModel.findById(userId)

        if (!avater || !user) {
            return next(new ErrorHandler("invalid user and avater", 400))
        }

        if (user?.avater?.public_id) {
            await cloudinary.uploader.destroy(user?.avater?.public_id)
            const myClould = await cloudinary.uploader.upload(avater, {
                folder: "avaters",
                width: 150
            })

            user.avater = {
                public_id: myClould.public_id,
                url: myClould.secure_url
            }

        } else {
            const myClould = await cloudinary.uploader.upload(avater, {
                folder: "avaters",
                width: 150
            })

            user.avater = {
                public_id: myClould.public_id,
                url: myClould.secure_url
            }
        }
        await redis.set(userId, JSON.stringify(user))
        await user.save()
        res.status(201).json({
            success: true,
            user
        })
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})


const userController = {
    registrationUser,
    activateUser,
    loginUser,
    logout,
    getUserInfo,
    updateAccessToken,
    socialAuth,
    updateUserInfo,
    changePassword,
    changeAvater
}

export default userController
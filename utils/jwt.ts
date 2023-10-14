require("dotenv").config()
import { Response } from "express";
import { IUser } from "../models/user.model";
import redis from "./redis";

interface ITokenOption {
    exprire: Date;
    maxAge: number;
    httpOnly: boolean;
    semeSite: "lex" | "strict" | "none" | undefined;
    secure?: boolean;
}

const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken()
    const refreshToken = user.SignRefreshToken()

    redis.set(user._id, JSON.stringify(user) as any)

    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300", 10)
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "1200", 10)

    const accessTokenOption: ITokenOption = {
        exprire: new Date(Date.now() + accessTokenExpire + 1000),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        semeSite: "lex",
        secure: process.env.NODE_ENV === "production",
    }
    const refreshTokenOption: ITokenOption = {
        exprire: new Date(Date.now() + refreshTokenExpire + 1000),
        maxAge: refreshTokenExpire * 1000,
        httpOnly: true,
        semeSite: "lex",
        secure: process.env.NODE_ENV === "production",
    }

    res.cookie("access_token", accessToken, accessTokenOption)
    res.cookie("refresh_token", refreshToken, refreshTokenOption)
    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    })
}



export default sendToken
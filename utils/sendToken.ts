import { Response } from "express";
import { IUser } from "../models/user.model";

interface ITokenOption {

}

const sendToken = (user: IUser, statusCode: number, res: Response) => {

}

export default sendToken
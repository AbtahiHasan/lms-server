import express from "express";
import userController from "../controller/user.controller";

const userRouter = express.Router()



userRouter.post("/registration", userController.registrationUser)
userRouter.post("/activate-user", userController.activateUser)


export default userRouter
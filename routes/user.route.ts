import express from "express";
import userController from "../controller/user.controller";

const userRouter = express.Router()



userRouter.post("/registration", userController.registrationUser)
userRouter.post("/activate-user", userController.activateUser)
userRouter.post("/login", userController.loginUser)


export default userRouter
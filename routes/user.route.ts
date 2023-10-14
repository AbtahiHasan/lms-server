import express from "express";
import userController from "../controller/user.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";

const userRouter = express.Router()



userRouter.post("/registration", userController.registrationUser)
userRouter.post("/activate-user", userController.activateUser)
userRouter.post("/login", userController.loginUser)
userRouter.get("/logout", isAuthenticated, userController.logout)


export default userRouter
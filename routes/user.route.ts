import express from "express";
import userController from "../controller/user.controller";
import { isAuthenticated, authorizeRoles } from "../middleware/auth";

const userRouter = express.Router()



userRouter.post("/registration", userController.registrationUser)
userRouter.post("/activate-user", userController.activateUser)
userRouter.post("/login", userController.loginUser)
userRouter.post("/social-auth", userController.socialAuth)
userRouter.get("/logout", isAuthenticated, userController.logout)
userRouter.get("/me", isAuthenticated, userController.getUserInfo)
userRouter.get("/refresh", userController.updateAccessToken)
userRouter.put("/update-user-info", isAuthenticated, userController.updateUserInfo)
userRouter.put("/update-user-password", isAuthenticated, userController.changePassword)


export default userRouter
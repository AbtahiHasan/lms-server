import express from "express"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"
import layoutController from "../controller/layout.controller"

const layoutRouter = express.Router()
layoutRouter.post("/create-layout", isAuthenticated, authorizeRoles("admin"), layoutController.createLayout)
layoutRouter.put("/edit-layout", isAuthenticated, authorizeRoles("admin"), layoutController.updateLayout)


export default layoutRouter
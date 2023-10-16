import express from "express"
import courseController from "../controller/course.controller"
import { authorizeRoles, isAuthenticated } from "../middleware/auth"

const courseRouter = express.Router()

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), courseController.uploadCourse)
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), courseController.editCourse)

export default courseRouter
import express from "express"
import courseController from "../controller/course.controller"

const courseRouter = express.Router()

courseRouter.post("/create-course", courseController.uploadCourse)
courseRouter.put("/edit-course/:id", courseController.editCourse)

export default courseRouter
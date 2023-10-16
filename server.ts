require("dotenv").config()
import { v2 as cloudinary } from "cloudinary"
import { app } from "./app"
const port = process.env.PORT || 8000
import connectDb from "./utils/db"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

app.listen(port, () => {
    console.log(`server is running at ${port}`)
    connectDb()
})
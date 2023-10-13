require("dotenv").config()
import mongoose from "mongoose";


const dbUrl: string = process.env.DB_URL || ""


const connectDb = async () => {
    try {
        await mongoose.connect(dbUrl).then((data: any) => {
            console.log(`database connected ${data.connection.host}`)
        })
    } catch (error: any) {
        console.log(error.message)
        setTimeout(() => {
            connectDb()
        }, 5000)
    }
}


export default connectDb
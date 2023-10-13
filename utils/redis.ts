require("dotenv").config()
import { Redis } from "ioredis"

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log("redis connected")
        return process.env.REDIS_URL

    }
    else {

        throw new Error("Redis connection failed")
    }

}


export default new Redis(redisClient())
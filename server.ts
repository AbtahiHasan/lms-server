require("dotenv").config()
import { app } from "./app"
const port = process.env.PORT || 8000
import connectDb from "./utils/db"

app.listen(port, () => {
    console.log(`server is running at ${port}`)
    connectDb()
})
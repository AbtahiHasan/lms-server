import mongoose, { Document, Model, Schema } from "mongoose";

interface INotification extends Document {
    title: string;
    message: string;
    status: string;
    user_id: string;
}

const notificationSchema = new Schema<INotification>({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: "unread"
    }
}, { timestamps: true })


const notificationModel: Model<INotification> = mongoose.model("notification", notificationSchema)

export default notificationModel
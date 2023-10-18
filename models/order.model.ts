import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrder extends Document {
    order_id: string;
    user_id: string;
    payment_info: object;
}

const orderSchema = new Schema<IOrder>({
    order_id: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    payment_info: {
        type: Object,
        // required: true
    },
}, { timestamps: true })


const orderModel: Model<IOrder> = mongoose.model("order", orderSchema)

export default orderModel
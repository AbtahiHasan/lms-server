import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from "bcrypt"
const emailRegexPattern: RegExp = /^\S+@\S+\.\S+$/

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avater: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;
    comparePassword: (password: string) => Promise<boolean>
}


const userSchema: Schema<IUser> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return emailRegexPattern.test(value)
            }
        },
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "password must be at least 6 characters"],
        select: false
    },
    avater: {
        public_id: String,
        url: String
    },
    role: {
        type: String,
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    courses: [
        {
            courseId: String
        }
    ]
}, { timestamps: true })


userSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


userSchema.methods.comparePassword = async function (enterdPassword: string): Promise<boolean> {
    return await bcrypt.compare(enterdPassword, this.password)
}

const userModel: Model<IUser> = mongoose.model("user", userSchema)

export default userModel;
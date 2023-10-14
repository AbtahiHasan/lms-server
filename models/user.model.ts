require("dotenv").config()
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { accessTokenOption, refreshTokenOption } from '../utils/jwt';
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
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
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

userSchema.methods.SignAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET || "", {
        expiresIn: "5m"
    })
}
userSchema.methods.SignRefreshToken = function () {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET || "", {
        expiresIn: "3d"
    })
}

const userModel: Model<IUser> = mongoose.model("user", userSchema)

export default userModel;
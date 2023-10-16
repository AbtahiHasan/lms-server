import mongoose, { Document, Model, Schema } from "mongoose";

interface IComment extends Document {
    user: object;
    comment: string;
    commentReplies: IComment[]
}

interface IRevew extends Document {
    user: string;
    rating: number;
    comment: string;
    commentReplies: IComment[]
}

interface ILink extends Document {
    title: string;
    url: string;
}

interface ICourseData extends Document {
    title: string;
    description: string;
    video_url: string;
    video_thumbnail: string;
    video_section: string;
    video_length: number;
    video_player: string;
    links: ILink[];
    suggestion: string;
    questions: IComment[];
}

interface ICourse extends Document {
    name: string;
    description: string;
    price: number;
    estimated_price?: number;
    thumbnail: object;
    tags: string;
    level: string;
    demo_url: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: IRevew[];
    course_data: ICourseData[];
    ratings?: number;
    purchased?: number;
}

const reviewsSchema = new Schema<IRevew>({
    user: Object,
    rating: {
        type: Number,
        default: 0
    },
    comment: String
})

const linkSchema = new Schema<ILink>({
    title: String,
    url: String
})

const commentSchma = new Schema<IComment>({
    user: Object,
    comment: String,
    commentReplies: [Object]
})

const courseDataSchema = new Schema<ICourseData>({
    video_url: String,
    // video_thumbnail: String,
    title: String,
    video_section: String,
    description: String,
    video_length: Number,
    video_player: String,
    links: [linkSchema],
    suggestion: String,
    questions: [commentSchma]
})

const courseSchema = new Schema<ICourse>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    estimated_price: Number,
    // thumbnail: {
    //     public_id: {
    //         type: String,
    //         required: true,
    //     },
    //     url: {
    //         type: String,
    //         required: true,
    //     },
    // },
    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demo_url: {
        type: String,
        required: true,
    },
    benefits: [{ title: String }],
    prerequisites: [{ title: String }],
    reviews: [reviewsSchema],
    course_data: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    purchased: {
        type: Number,
        default: 0,
    },
})

const courseModel: Model<ICourse> = mongoose.model("course", courseSchema)
export default courseModel
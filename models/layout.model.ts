import mongoose, { Document, Model, Schema } from "mongoose";

interface FaqItem extends Document {
    question: string;
    answar: string;
}

interface Category extends Document {
    title: string;
}

interface BannerImage extends Document {
    public_id: string;
    url: string;
}

interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: Category[];
    banner: {
        image: BannerImage;
        title: string;
        subtitle: string
    }
}

const faqSchma = new Schema<FaqItem>({
    question: String,
    answar: String
})

const categorySchma = new Schema<Category>({
    title: String
})

const bannerImageSchma = new Schema<BannerImage>({
    public_id: String,
    url: String,
})

const layoutSchma = new Schema<Layout>({
    type: String,
    faq: [faqSchma],
    categories: [categorySchma],
    banner: {
        image: bannerImageSchma,
        title: String,
        subtitle: String
    }
})


const layoutModel: Model<Layout> = mongoose.model("layout", layoutSchma)
export default layoutModel
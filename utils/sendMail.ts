require("dotenv").config()
import nodemailer, { Transporter } from "nodemailer"
import ejs from "ejs"
import path from "path"
interface IEmailOptions {
    email: string;
    subject: string;
    templete: string;
    data: { [key: string]: any }
}

const sendMail = async (options: IEmailOptions) => {
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    const { email, subject, templete, data } = options

    const templatePath = path.join(__dirname, "../mails/", templete)
    const html: string = await ejs.renderFile(templatePath, data)

    await transporter.sendMail({
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html
    })

}


export default sendMail
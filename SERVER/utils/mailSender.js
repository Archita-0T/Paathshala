//when user sign up an otp is sent on his mail before the data of his entry is created in db's doc
//mail sending setup
const nodemailer = require("nodemailer");
const mailSender = async (email, title, body) =>{
    try{
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        let info = await transporter.sendMail({
            from:'Paathshala',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`

        })
        console.log(info);
        return info;

    }
    catch(error){
        console.log(error.message);

    }
}
module.exports=mailSender;
const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate=require("../mail/templates/emailVerificationTemplate");
const OTPSchema = new mongoose.Schema({
 email : {
    type : String,
    required : true
 },
 otp : {
    type : String,
    required : true

 },
 createdAt : {
    type : Date,
    default : Date.now(),
    expires : 5*60
 }
})

//fxn to send emails
//below email parameter inside fxn is the email to which verification mail is to be sent, 2nd parameter being the otp to be sent
async function sendVerificationEmail(email, otp){
   try{
      const mailResponse = await mailSender(email, "Verification Email from Paathshala", emailTemplate(otp) );
      console.log("Email sent successfully :", mailResponse);
   }
   catch(error){
      console.log("error occured while sending mails :", error);
      throw error;
   }
}
// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function(next){
   console.log("New document saved to database");
   // Only send an email when a new document is created
   if(this.isNew){ await sendVerificationEmail(this.email, this.otp);}
  
   next();
})
module.exports = mongoose.model("OTP", OTPSchema);
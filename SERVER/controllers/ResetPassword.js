const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto=require("crypto");
//resetPasswordToken
exports.resetPasswordToken = async(req, res)=>{
    try{
        //get email from req body
    const email = req.body.email;
    //check if user corresponding to above email exists
    const user = await User.findOne({email: email});
    if(!user){
        return res.json({success:false, message:"Your email is not registered with us"});

    }
    //generate token
    const token = crypto.randomBytes(20).toString("hex");
    //add this token and it's expiry time to user
    const updatedDetails=await User.findOneAndUpdate({email:email},
        {
            token, resetPasswordExpires: Date.now() + 3600000,
        },
        {new:true,}
    )
    console.log("Details after updation", updatedDetails);
    // create front-end link to update password with individual's user's token
    const url =`http://localhost:3000/update-password/${token}`
    //send mail containing the above url
    await mailSender(email, "Password Reset Link", `Password Reset Link: ${url}`);
    //return success res
    return res.json({success:true, message:"Email sent successfully, please check and reset your password"})

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false, message:"Something went wrong, while sending the mail for password reset"
        })

    }

    
}
//resetPassword
exports.resetPassword = async(req, res)=>{
    try{
        //data fetch
        const {password, confirmPassword, token}=req.body;
        //validation
        if(confirmPassword !== password){
            return res.json({success:false, message:"Passwords are not matching "})
        }
        //get user details from db using token
        const userDetails = await User.findOne({token:token});
        //if no entry found
        if(!userDetails){
            return res.json({success:false, message:"Token is invalid"})
        }
        //check expiration time of token
        if(!(userDetails.resetPasswordExpires > Date.now())){
            return res.json({success:false, message:"Token is expired, please regenerate your token"})


        }
        //hash pwd
        const hashedPassword=await bcrypt.hash(password, 10);
        //password update
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        )
        //return res
        return res.status(200).json({success:true, message:"Password reset successfully" })
}
    catch(error){
        console.log(error);
        return res.status(500).json({success:false, message:"Something went wrong, please try again"})

    }
}
const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const Profile = require("../models/Profile")
require("dotenv").config();

//signUp 
exports.signUp=async(req,res)=>{

    try{
        //fetch data from req body
    const{firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp}=req.body;
    //validate data
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        })
    }
    //check if password & confirmPassword match
    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:'Passwords do not match, please enter correct passwords'
        })
    }
        //check if user already exists
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:'User is already registered'
            })
        }
        //find most recent OTP stored for the user
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
        //Validate OTP
        if(recentOtp.length==0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP not found',
            })
        }else if(otp !== recentOtp[0].otp){
            //Invalid otp
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            })
        }
        //hash password
        const hashedPassword=await bcrypt.hash(password, 10);
        //create an entry of user in DB
        let approved="";
        approved==="Instructor" ? (approved=false) : (approved=true);
    
        const profileDetails=await Profile.create({
            gender:null, dateOfBirth:null, about:null, contactNumber:null
        })
        const user=await User.create({
            firstName, lastName, email, contactNumber,
            password:hashedPassword, accountType:accountType, approved:approved, 
            additionalDetails:profileDetails._id, 
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered, please try again',
        })


    }
    

}

//Login
exports.login = async(req,res)=>{
    try{
        //get data from req body
        const {email, password}=req.body;
        //validate data received
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'All fields are required',
            })
        } 
        //check if user exists
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                sucess:false,
                message:'User is not registered, please signup first',
            })
        }
        //generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {
			const token = jwt.sign(
				{ email: user.email, id: user._id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);
            //save token to user doc in db
            user.token=token;
            user.password=undefined;
            //create cookie and send res
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,

            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token, user, message:'Logged in successfully',

            })

        }
        else{ return res.status(401).json({
            success:false, message:'Password is incorrect',
        })

        }



    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false, message:'Login failure, please try again',
        })

    }
}

//sendOTP
exports.sendOTP=async(req,res)=>{
    try{
        //fetch email from req body
        const {email} = req.body;
        //check if user already exists
        const checkUserPresent=await User.findOne({email});
        //if he exists send him status already registered
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
        //if he's not registered
        //generate OTP to register him
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,

        })
        console.log("OTP generated", otp);
        //check if otp is unique or not
        const result=await OTP.findOne({otp:otp});
        console.log(result);
        while(result){
             otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                
    
            })
            
            
        }
        //create an entry of otp in db
        const otpPayload={email, otp};
        const otpBody=await OTP.create(otpPayload);
        console.log(otpBody);
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp
        })


    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
  
} 


//changePassword


exports.changePassword = async (req, res) => {
	try {
		//fetch user data from req.user
		const userData = await User.findById(req.user.id);

		//fetch old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		//Validate old password
		const isPasswordMatch = await bcrypt.compare(oldPassword, userData.password);
      
		//if old password entered is wrong 
		if (!isPasswordMatch) {return res.status(401).json({ 
                success: false, message: "The password is incorrect",
            });
		}

		//check if new password and confirm new password matches
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"Password for your account has been updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res.status(200).json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
}


const RatingAndReview=require("../models/RatingAndReview")
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating handler fxn
exports.createRating = async (req,res)=>{
  try {
    const userId=req.user.id;
    const {rating, review,courseId} = req.body;
    //check if user is enrolled or not in the course which he's rating
    const courseDetails= await Course.find({_id: courseId,
     studentsEnrolled: {$elemMatch:{$eq:userId}}});
     if(!courseDetails){
         return res.status(404).json({success:false,message: "Student is not enrolled in the course"});
     };
     //check if user already reviewed the course
     const alreadyReviewed =await RatingAndReview.findOne({user:userId,
     course:courseId});
 
     if(alreadyReviewed){
         return res.status(403).json({success: false,message: "Course is already reviewed by the user"});
     }
     //create rating
     const ratingReview= await RatingAndReview.create({rating,
         review,
         course:courseId,
         user:userId});
         //update course with rating review
         await Course.findByIdAndUpdate({_id:courseId},
             {
             $push:{
             ratingAndReviews: ratingReview._id
         }},
        {new:true});
 
 
     res.status(200).json({
        success: true,
        message: "Rating and review created successfully",
        ratingReview});
    
  } catch (error) {
    console.log(error);
    res.status(500).json({message: error.message}); 
  }
}

//get avg rating handler fxn 
exports.getAverageRating = async (res,req)=>{
    try {
        const courseId=req.body.courseId;
        const result= await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg:"$rating"}
                }
            }
        ]);

        if(result.length > 0) {
            return res.status(200).json({averageRating: result[0].averageRating});
        }
        else{
            return res.status(200).json({message: "Average rating is 0, no ratings is given till now",
        averageRating:0});
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
};

//get all ratings 
exports.getAllRating = async (req,res) => {
    
    try {
        const allReviews = await RatingAndReview.find(
            ).sort({rating: -1})  //rating:-1 would sort the ratings in descending order on UI
            .populate({path: "user",
            select: "firstName lastName email image"})
            .populate({path: "course",
            select: "courseName"})
            .exec();
            
        return res.status(200).json({
            success: true,
            message:"All reviews fetched successfully",
            data:allReviews,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}
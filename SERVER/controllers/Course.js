const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const CourseProgress = require("../models/CourseProgress");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
//createCourse handler fxn
exports.createCourse=async (req, res)=>{
    try{
        //fetch data
        let {courseName, courseDescription, whatYouWillLearn, price, category, tag, status, instructions}=req.body;
        //get thumbnail
        const thumbnail=req.files.thumbnailImage;
        //validation on fetched data
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !tag || !thumbnail){
            return res.status(400).json({success:false, message:"All fields are required"})
        }
        if(!status || status === undefined){status="Draft"}
        //instructor's validation is already done by middleware
        //fetch instructor's details bcoz it's data will be used in course
        const userId = req.user.id;
        const instructorDetails=await User.findById(userId,{accountType:"Instructor"});
        console.log(instructorDetails);
        if(!instructorDetails){return res.status(404).json({
            success:false, message:"Instructor details not found"
        })}
        //validation for category whether the category is valid or not
        const categoryDetails=await Category.findById(category);
        if(!categoryDetails){return res.status(404).json({
            success:false, message:"Category details not found"
        })}

        //upload image to cloudinary
        let thumbnailImage;
        try {
          thumbnailImage = await uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME || "default-folder"
          );
        } catch (uploadError) {
          return res.status(500).json({
            success: false,
            message: "Error uploading thumbnail image",
            error: uploadError.message,
          });
        }
        //create entry for new course
        const newCourse=await Course.create({
            courseName, courseDescription, instructor:instructorDetails._id, whatYouWillLearn:whatYouWillLearn, 
            price, tag:tag, category:categoryDetails._id, thumbnail:thumbnailImage.secure_url, status:status, instructions:instructions,
        })
        //add the new course to the user schema of instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id}, 
            {
                $push:{
                    courses: newCourse._id,
                }
            },
            {new:true},
        )
        //update the category schema, add the new course to the category schema
        await Category.findByIdAndUpdate(
        { _id: category },
        {
          $push: {
            courses: newCourse._id,
          },
        },
        { new: true }
      )
      
        //return res
        return res.status(200).json({success:true, message:"Course created successfully", data:newCourse})
}
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false, message:"Failed to create course", error:error.message
        })
       
       


    }
}
//getAllCourses handler fxn
exports.showAllCourses=async(req,res)=>{
    try{
        const allCourses=await Course.find({},
            {
                courseName:true,
                price:true,
                thumbnail:true,
                instructor:true,
                ratingAndReviews:true,
                studentsEnrolled:true,
            }
        ).populate("instructor").exec();
        return res.status(200).json({success:true, message:"Data for all courses fetched successfully", data:allCourses,})

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false, message:"Cannot fetch course data", error:error.message
        })
    }
}

//getCourseDetails

exports.getCourseDetails = async (req, res) => {
    try {//get course id
      const { courseId } = req.body;
      //get course details
      const courseDetails = await Course.find({ _id: courseId })
        .populate({ path: "instructor", populate: { path: "additionalDetails" } })
        .populate("category")
        .populate({
          //only populate user name and image
          path: "ratingAndReviews",
          populate: {
            path: "user",
            select: "firstName lastName accountType image",
          },
        })
        .populate({ path: "courseContent", populate: { path: "SubSection" } })
        .exec();
  
      if (!courseDetails) {
        return res.status(404).json({
          success: false,
          message: `Course Not Found with id ${courseId}`,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Course fetched successfully",
        data: courseDetails,
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json({
        success: false,
        message: `Can't Fetch Course Data`,
        error: error.message,
      });
    }
  };
  
  // Function to get all courses of a particular instructor
  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get user ID from request object
      const userId = req.user.id;
  
      // Find all courses of the instructor
      const allCourses = await Course.find({ instructor: userId });
  
      // Return all courses of the instructor
      res.status(200).json({
        success: true,
        data: allCourses,
      });
    } catch (error) {
      // Handle any errors that occur during the fetching of the courses
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch courses",
        error: error.message,
      });
    }
  };
  
  //Edit Course Details
  exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body;
      const updates = req.body;
      const course = await Course.findById(courseId);
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update");
        const thumbnail = req.files.thumbnailImage;
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        );
        course.thumbnail = thumbnailImage.secure_url;
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key]);
          } else {
            course[key] = updates[key];
          }
        }
      }
  
      await course.save();
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  };
  
  //get full course details
  exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body;
      const userId = req.user.id;
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec();
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userID: userId,
      });
  
      console.log("courseProgressCount : ", courseProgressCount);
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        });
      }
  
    
  
      let totalDurationInSeconds = 0;
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration);
          totalDurationInSeconds += timeDurationInSeconds;
        });
      });
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : ["none"],
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  //Delete Course
  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body;
      // Find the course
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled;
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        });
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent;
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId);
        if (section) {
          const subSections = section.subSection;
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId);
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId);
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId);
  
      //Delete course id from Category
      await Category.findByIdAndUpdate(course.category._id, {
        $pull: { courses: courseId },
      });
  
      //Delete course id from Instructor
      await User.findByIdAndUpdate(course.instructor._id, {
        $pull: { courses: courseId },
      });
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };
  
  //search course by title,description and tags array
  exports.searchCourse = async (req, res) => {
    try {
      const { searchQuery } = req.body;
      //   console.log("searchQuery : ", searchQuery)
      const courses = await Course.find({
        $or: [
          { courseName: { $regex: searchQuery, $options: "i" } },
          { courseDescription: { $regex: searchQuery, $options: "i" } },
          { tag: { $regex: searchQuery, $options: "i" } },
        ],
      })
        .populate({
          path: "instructor",
        })
        .populate("category")
        .populate("ratingAndReviews")
        .exec();
  
      return res.status(200).json({
        success: true,
        data: courses,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  
  //mark lecture as completed
  exports.markLectureAsComplete = async (req, res) => {
    const { courseId, subSectionId, userId } = req.body;
    if (!courseId || !subSectionId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    try {
      progressAlreadyExists = await CourseProgress.findOne({
        userID: userId,
        courseID: courseId,
      });
      const completedVideos = progressAlreadyExists.completedVideos;
      if (!completedVideos.includes(subSectionId)) {
        await CourseProgress.findOneAndUpdate(
          {
            userID: userId,
            courseID: courseId,
          },
          {
            $push: { completedVideos: subSectionId },
          }
        );
      } else {
        return res.status(400).json({
          success: false,
          message: "Lecture already marked as complete",
        });
      }
      await CourseProgress.findOneAndUpdate(
        {
          userId: userId,
          courseID: courseId,
        },
        {
          completedVideos: completedVideos,
        }
      );
      return res.status(200).json({
        success: true,
        message: "Lecture marked as complete",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
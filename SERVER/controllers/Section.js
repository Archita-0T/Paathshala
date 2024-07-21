const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection=require("../models/SubSection");
exports.createSection=async(req,res)=>{
    try{
        //fetch data
        const {sectionName, courseId}=req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({success:false, message:"All fields are required"})
        }
        const ifCourse= await Course.findById(courseId);
		if (!ifCourse) {
			return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        // Create a new section with the given name
        const newSection=await Section.create({sectionName});
        //update course schema with section objectId
        const updatedCourseDetails=await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{courseContent:newSection._id}
            },
            {new:true}
        ).populate({
            path: "courseContent",
            populate: {
                path: "SubSection",
                
            },
        }).exec();
        // Return the updated course object in the response
		res.status(200).json({
			success: true,
			message: "Section created successfully",
			updatedCourseDetails,
		});
}
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong whilst creating section, please try again",
            error:error.message
        })
        
    }
}

// updateSection handler fxn
exports.updateSection=async(req,res)=>{
    try{
        //data fetch
        const {sectionName, sectionId, courseId}=req.body;
        //data validation
        if(!sectionName || !sectionId || !courseId){
            return res.status(400).json({success:false, message:"All fields are required"})
        } 
        //update data
        const section=await Section.findByIdAndUpdate(
            sectionId,
            {sectionName},
            {new:true}
        )
        const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"SubSection",
			},
		})
		.exec();

		res.status(200).json({
			success: true,
			message: "Section updated successfully",
			data:course,
		});

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong whilst updating section, please try again",
            error:error.message
        })
    }
}

//delete section
exports.deleteSection=async(req,res)=>{
    try{
        //fetch section id from req params
        
        const {sectionId, courseId}=req.body;
          // Validate input parameters
          if (!sectionId || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Section ID and Course ID are required",
            });
        }
          // Check if the section exists
          const section = await Section.findById(sectionId);
          if (!section) {
              return res.status(404).json({
                  success: false,
                  message: "Section not found",
              });
          }

        //delete section
        await Section.findByIdAndDelete(sectionId);
            // Check if the section was actually deleted
            const deletedSection = await Section.findById(sectionId);
            if (deletedSection) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the section",
                });
            }
            //fetch the updated course
        const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "SubSection" } }).exec();
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            updatedCourse
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong whilst deleting section, please try again",
            error:error.message
        })

    }
}




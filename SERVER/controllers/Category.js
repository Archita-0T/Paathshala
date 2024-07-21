const Category = require("../models/Category");
const Course=require("../models/Course");
//create category handler
exports.createCategory = async(req, res)=>{
    try{console.log("Request received for createCategory");
        const {name, description}=req.body;
        if(!name){
            return res.status(400).json({success:false, message:"All fields are required"})
        }
		console.log("Creating category in the database");
        //create entry in db
        const categoryDetails = await Category.create({
            name:name,
            description:description,
        })
        console.log("Category created: ", categoryDetails);
        return res.status(200).json({success:true, message:"Category created successfully"})

    }
    catch(error){
		console.error("Error creating category: ", error);
        return res.status(500).json({success:false, message:error.message})
    }
}
//getAllCategory handler fxn
exports.showAllCategory=async(req, res)=>{
    try{
		
        const allCategory = await Category.find({}, {name:true, description:true} )
        res.status(200).json({success:true, message:"All Category returned successfully", data: allCategory})
    }
    catch(error){
        return res.status(500).json({success:false, message:error.message})
    }
}

//category page details handler fxn
exports.categoryPageDetails = async (req, res) => {
	try {
		const { categoryId } = req.body;

		// Get courses for the specified category
		const selectedCategory = await Category.findById(categoryId)          
			.populate({path:"courses",match:{status:"Published"},populate:([{path:"instructor"},{path:"ratingAndReviews"}])})
			.exec();
            //populate instuctor and rating and reviews from courses
		console.log("selected category", selectedCategory);
		// Handle the case when the category is not found
		if (!selectedCategory) {
			return res.status(404).json({ success: false, message: "Category not found" });
		}
		// Handle the case when there are no courses
		if (selectedCategory.courses.length === 0) {
			console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		const selectedCourses = selectedCategory.courses;
		console.log('Selected Courses:', selectedCourses);
		// Get courses for other categories
		const categoriesExceptSelected = await Category.find({
			_id: { $ne: categoryId },
		}).populate({path:"courses",match:{status:"Published"},populate:([{path:"instructor"},{path:"ratingAndReviews"}])});
		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

		// Get top-selling courses across all categories
		const allCategories = await Category.find().populate({path:"courses",match:{status:"Published"},populate:([{path:"instructor"},{path:"ratingAndReviews"}])});
		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses: mostSellingCourses,
			success: true,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};

//add course to category
exports.addCourseToCategory = async (req, res) => {
	const { courseId, categoryId } = req.body;
	// console.log("category id", categoryId);
	try {
		const category = await Category.findById(categoryId);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found",
			});
		}
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				success: false,
				message: "Course not found",
			});
		}
		if(category.courses.includes(courseId)){
			return res.status(200).json({
				success: true,
				message: "Course already exists in the category",
			});
		}
		category.courses.push(courseId);
		await category.save();
		return res.status(200).json({
			success: true,
			message: "Course added to category successfully",
		});
	}
	catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
}
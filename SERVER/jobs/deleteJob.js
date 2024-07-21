const schedule = require('node-schedule');
const User = require('../models/User');
const Course=require("../models/Course");
const Profile=require("../models/Profile");
const CourseProgress=require("../models/CourseProgress");
exports.startJob = () => {
  schedule.scheduleJob('*/1 * * * *', async () => {
    try {
      const now = new Date();
      const usersToDelete = await User.find({ deletionTimestamp: { $lte: now } });

      usersToDelete.forEach(async (user) => {
        // Delete user's profile
        await Profile.findByIdAndDelete(user.additionalDetails);

        // Update total students enrolled
        for (const courseId of user.courses) {
          await Course.findByIdAndUpdate(
            courseId,
            { $pull: { studentsEnrolled: user._id } },
            { new: true }
          );
        }

        // Delete user record
        await User.findByIdAndDelete(user._id);

        // Optionally delete user course progress
        await CourseProgress.deleteMany({ userId: user._id });

        console.log(`Deleted user: ${user.email}`);
      });
    } catch (error) {
      console.error('Error during job execution:', error);
    }
  });
};
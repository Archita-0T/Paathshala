import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserCourses as getUserEnrolledCourses } from "../../../services/operations/profileAPI";
import ProgressBar from "@ramonak/react-progress-bar";
import { useNavigate } from "react-router";

const EnrolledCourses = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getEnrolledCourses = async () => {
    setLoading(true);
    try {
      const response = await getUserEnrolledCourses(token, dispatch);
      console.log("getEnrolledCourses -> response", response);

      if (response && response.courses && response.courseProgress) {
        setEnrolledCourses(response.courses);
        setProgressData(response.courseProgress);
      } else {
        console.error("Failed to fetch enrolled courses or progress data");
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalNoOfLectures = (course) => {
    let total = 0;
    course.courseContent.forEach((section) => {
      total += section.subSection.length;
    });
    return total;
  };

  useEffect(() => {
    getEnrolledCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh)] w-full justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-richblack-500"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-11/12 max-w-[1000px] py-10">
      <div className="text-3xl text-richblack-50">Enrolled Courses</div>
      {enrolledCourses.length === 0 ? (
        <p className="grid h-[10vh] w-full place-content-center text-richblack-5">
          You have not enrolled in any course yet
        </p>
      ) : (
        <div className="my-8 text-richblack-5">
          <div className="flex rounded-t-lg bg-richblack-500 ">
            <p className="w-[45%] px-5 py-3">Course Name</p>
            <p className="w-1/4 px-2 py-3"></p>
            <p className="flex-1 px-2 py-3">Progress</p>
          </div>
          {enrolledCourses.map((course, index) => (
            <div
              key={index}
              onClick={() => {
                navigate(
                  `view-course/${course._id}/section/${course.courseContent[0]._id}/sub-section/${course.courseContent[0].subSection[0]._id}`
                );
              }}
              className="flex items-center border border-richblack-700 rounded-none cursor-pointer"
            >
              <div className="flex w-[45%] items-center gap-4 px-5 py-3">
                <img
                  className="h-14 w-14 rounded-lg object-cover"
                  src={course.thumbnail}
                  alt={`${course.courseName} thumbnail`}
                />
                <div className="flex max-w-xs flex-col gap-2">
                  <p className="font-semibold">{course.courseName}</p>
                  <p className="text-xs text-richblack-300 hidden md:block">
                    {course.courseDescription.length > 50
                      ? course.courseDescription.slice(0, 50) + "...."
                      : course.courseDescription}
                  </p>
                </div>
              </div>
              <div className="w-1/4 px-2 py-3">{course?.totalDuration}</div>
              <div className="flex w-1/5 flex-col gap-2 px-2 py-3">
                {progressData.map((progress, idx) => {
                  if (progress?.courseID === course?._id) {
                    return (
                      <div key={idx}>
                        <p>
                          Completed: {progress?.completedVideos?.length} /{" "}
                          {totalNoOfLectures(course)}
                        </p>
                        <ProgressBar
                          completed={
                            (progress?.completedVideos?.length /
                              totalNoOfLectures(course)) *
                            100
                          }
                          height="8px"
                          isLabelVisible={false}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;


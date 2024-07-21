import React from 'react';
import {Link} from 'react-router-dom';
import { FaArrowRight } from "react-icons/fa6";
import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from '../components/core/HomePage/Button';
import Banner from '../assets/Images/banner.mp4';
import CodeBlocks from '../components/core/HomePage/CodeBlocks';
import Footer from '../components/common/Footer';
const Home = () => {
  return (
    <div>
      {/* Section1 */}
      <div className='group relative mx-auto flex flex-col w-11/12 max-w-maxContent gap-8 items-center text-white justify-between'>
        <Link to={"/signUp"}>
        <div className='mt-16 p-1 mx-auto rounded-full bg-richblack-800 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit drop-shadow-[0_1.5px_rgba(255,255,255,0.3)] hover:drop-shadow-none'>
            <div className='flex flex-row items-center gap-2 rounded-full px-10 py-[5px] group-hover:bg-richblack-900'>
                <p>Become an Instructor</p>
                <FaArrowRight />
            </div>
        </div>
        </Link>
        <div className='text-center text-4xl font-semibold'>
            Advance Your Future with
            <HighlightText text={"Coding Skills"}/>
        </div>
        <div className="-mt-3 w-[90%] text-center text-lg font-bold text-richblack-300">
          With our online coding courses, you can learn at your own pace, from
          anywhere in the world, and get access to a<br></br> wealth of resources,
          including hands-on projects, quizzes, and personalized feedback from
          instructors.
        </div>
        <div className="mt-8 flex flex-row gap-7">
          <CTAButton active={true} linkTo={"/signUp"}>
            Learn More
          </CTAButton>
          <CTAButton active={false} linkTo={"/login"}>
            Book a Demo
          </CTAButton>
        </div>
        <div className="mx-3 my-7 w-[70%] shadow-[10px_-5px_50px_-5px] shadow-blue-200">
          <video
            className="shadow-[20px_20px_rgba(255,255,255)] w-[100%]"
            muted
            loop
            autoPlay
          >
            <source src={Banner} type="video/mp4" />
          </video>
        </div>

        <div>
          <CodeBlocks
            position={"lg:flex-row"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                Unlock your<HighlightText text={"coding potential"} />{" "}
                with our online courses.
              </div>
            }
            subheading={
              "Our courses are designed and taught by industry experts who have years of experience in coding and are passionate about sharing their knowledge with you."
            }
            ctabtn1={{
              btnText: "Try it Yourself",
              link: "/signUp",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signUp",
              active: false,
            }}
            codeColor={"text-yellow-25"}
            codeblock={`<!DOCTYPE html>\n <html lang="en">\n<head>\n<title>This is myPage</title>\n</head>\n<body>\n<h1><a href="/">Header</a></h1>\n<nav> <a href="/one">One</a> <a href="/two">Two</a> <a href="/three">Three</a>\n</nav>\n</body>`}
            backgroundGradient={<div className="codeblock1 absolute inset-0 bg-gradient-to-t from-yellow-100 via-yellow-500 to-transparent opacity-20 rounded-[%] "></div>}
          />
        </div>
        <div>
          <CodeBlocks
            position={"lg:flex-row-reverse"}
            heading={
              <div className="w-[100%] text-4xl font-semibold lg:w-[50%]">
                Start
                <HighlightText text={"coding in seconds"} />
              </div>
            }
            subheading={
              "Go ahead, give it a try. Our hands-on learning environment means you'll be writing real code from your very first lesson."
            }
            ctabtn1={{
              btnText: "Continue Lesson",
              link: "/signUp",
              active: true,
            }}
            ctabtn2={{
              btnText: "Learn More",
              link: "/signUp",
              active: false,
            }}
            codeColor={"text-white"}
            codeblock={`import React from "react";\n import CTAButton from "./Button";\nimport TypeAnimation from "react-type";\nimport { FaArrowRight } from "react-icons/fa";\n\nconst Home = () => {\nreturn (\n<div>Home</div>\n)\n}\nexport default Home;`}
            backgroundGradient={<div className="codeblock2 absolute inset-0 bg-gradient-to-b from-blue-100 via-blue-500 to-transparent opacity-20 rounded-[%] "></div>}
          />
        </div>

      </div>
      <Footer />
    </div>
  )
}

export default Home
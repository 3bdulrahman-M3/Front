import React from "react";
import Hero from "../components/Hero";
import ExploreCourses from "../components/ExploreCourses";
import RecommendedCourses from "../components/RecommendedCourses";
import CourseCategories from "../components/CourseCategories";
import FeaturedInstructors from "../components/FeaturedInstructors";
import Testimonials from "../components/Testimonials";
import CallToAction from "../components/CallToAction";
import SessionsHero from "../components/SessionsHero";

const LandingPage = () => {
  return (
    <>
      <Hero />
      <SessionsHero />
      <ExploreCourses />
      <RecommendedCourses />
      <CourseCategories />
      <FeaturedInstructors />
      <Testimonials />
      <CallToAction />
    </>
  );
};

export default LandingPage;

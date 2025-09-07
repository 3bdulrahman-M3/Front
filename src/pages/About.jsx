import React from "react";
import Navbar from "../components/Navbar";
import { Users, Target, BookOpen, Sparkles } from "lucide-react";

const AboutPage = () => {
  return (
    <>
      <section
        className="relative min-h-[70vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6"
        style={{ paddingTop: "120px", paddingBottom: "100px" }}
      >
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
          alt="About Us"
          className="w-full max-w-4xl rounded-2xl shadow-xl mb-8"
        />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Platform
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          We believe in empowering students and instructors with tools that make
          learning engaging, accessible, and future-ready.
        </p>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600">
            Our mission is to create a space where education meets innovation.
            Whether you’re a student eager to learn or an instructor ready to
            share knowledge, we provide the bridge to make it happen.
          </p>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Users className="h-10 w-10 text-blue-600" />,
              title: "Community",
              desc: "Connect with learners and educators from around the globe.",
            },
            {
              icon: <Target className="h-10 w-10 text-purple-600" />,
              title: "Focused Learning",
              desc: "Stay on track with structured courses and expert guidance.",
            },
            {
              icon: <BookOpen className="h-10 w-10 text-blue-600" />,
              title: "Quality Content",
              desc: "Learn with carefully curated materials designed for impact.",
            },
            {
              icon: <Sparkles className="h-10 w-10 text-purple-600" />,
              title: "Innovation",
              desc: "Experience learning enhanced by modern design & tech.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg p-6 text-center transition transform hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to start your journey?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join us today and be part of a growing community of learners and
          educators shaping the future.
        </p>
        <a
          href="/register"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          Get Started
        </a>
      </section>
    </>
  );
};

export default AboutPage;

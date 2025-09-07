import React from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

const benefits = [
  "Lifetime access to all courses",
  "Expert instructor support",
  "Community access and networking",
  "Certificate of completion",
  "Mobile app access",
  "30-day money-back guarantee",
];

const CallToAction = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Join TutorFlow today and start your journey towards professional
                success. With our comprehensive courses and expert guidance,
                you'll gain the skills needed to excel in today's competitive
                job market.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                onClick={() => (window.location.href = "/courses")}
              >
                Start Learning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>

              <button
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
                onClick={() => (window.location.href = "/about")}
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-blue-200 mb-4 font-semibold">What you get:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

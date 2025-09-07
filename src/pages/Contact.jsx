import React, { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle } from "lucide-react";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section
        className="relative min-h-[50vh] flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6"
        style={{ paddingTop: "120px", paddingBottom: "80px" }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Get in{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Touch
          </span>
        </h1>
        <p className="max-w-2xl text-lg text-gray-600">
          Have questions or suggestions? We'd love to hear from you. Reach out
          using the form below or our contact details.
        </p>
      </section>

      {/* Contact Form + Info */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h2>

            {submitted && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle className="text-green-600 h-6 w-6" />
                <span className="text-green-700 font-medium">
                  Thank you! We’ll get back to you soon.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Your message..."
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Contact Information
            </h2>
            <p className="text-gray-600 mb-8">
              You can also reach us directly via email, phone, or visit us at
              our location.
            </p>
            <ul className="space-y-6">
              <li className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-blue-600" />
                <span className="text-gray-700">support@example.com</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-purple-600" />
                <span className="text-gray-700">+123 456 7890</span>
              </li>
              <li className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-blue-600" />
                <span className="text-gray-700">
                  123 Learning St, Knowledge City
                </span>
              </li>
            </ul>

            {/* Map/Illustration */}
            <div className="mt-10">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80"
                alt="Office location"
                className="w-full rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;

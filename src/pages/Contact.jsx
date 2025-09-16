import React from "react";
import ChatInterface from "../components/ChatInterface";
import { MessageCircle, Headphones, Clock, Shield, Mail, Phone, Zap } from "lucide-react";

const ContactPage = () => {
  return (
    <>
      {/* Split Screen Layout */}
      <section
        className="relative min-h-[80vh] flex items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6 overflow-hidden"
        style={{ paddingTop: "120px", paddingBottom: "40px" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-500 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Support Chat Info */}
            <div className="text-center lg:text-left">
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-4 shadow-xl">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Support{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Need help? Chat with our support team in real-time.
              </p>

              {/* Features - Compact */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                  <Headphones className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 text-sm">24/7 Support</h3>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                  <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 text-sm">Quick Response</h3>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
                  <Shield className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800 text-sm">Secure & Private</h3>
                </div>
              </div>
            </div>

            {/* Right Side - Chat Interface */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              <div className="h-[500px] flex flex-col">
                <ChatInterface />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;

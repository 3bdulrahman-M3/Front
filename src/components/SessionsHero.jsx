// src/components/LandingHero.jsx
import React from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SessionHero = () => {
  const navigate = useNavigate();

  const handleExplore = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate("/sessions");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1920&q=80"
        alt="Peer learning"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />

      {/* Overlay Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
          Learn Together, Grow Together 📚
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 mb-10">
          Explore live peer-to-peer sessions created by students. Collaborate,
          share knowledge, and connect in real time.
        </p>

        <button
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
          onClick={() => handleExplore()}
        >
          Try Sessions
          {/* <ArrowRight className="ml-2 h-5 w-5" /> */}
        </button>
      </div>
    </section>
  );
};

export default SessionHero;

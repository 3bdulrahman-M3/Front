import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="text-8xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        404
      </div>
      <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
        Page not found
      </h1>
      <p className="mt-2 text-gray-600 max-w-xl">
        The page you’re looking for doesn’t exist or was moved. Try going back
        home or exploring our courses.
      </p>
      <div className="mt-6 flex gap-3">
        <a
          href="/"
          className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:opacity-95"
        >
          Go Home
        </a>
        <a
          href="/courses"
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Explore Courses
        </a>
      </div>
    </div>
  );
};

export default NotFound;

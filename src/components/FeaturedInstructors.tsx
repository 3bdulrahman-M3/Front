import React from 'react';
import { Star, Users, BookOpen } from 'lucide-react';

const instructors = [
  {
    name: 'Sarah Chen',
    role: 'Senior Software Engineer at Google',
    speciality: 'Full-Stack Development',
    rating: 4.9,
    students: 12500,
    courses: 8,
    image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'David Rodriguez',
    role: 'Creative Director at Adobe',
    speciality: 'UI/UX Design',
    rating: 4.8,
    students: 9800,
    courses: 6,
    image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'Emily Thompson',
    role: 'Marketing Lead at Meta',
    speciality: 'Digital Marketing',
    rating: 4.9,
    students: 15200,
    courses: 12,
    image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'Michael Park',
    role: 'Data Science Manager at Tesla',
    speciality: 'Machine Learning & AI',
    rating: 4.9,
    students: 8600,
    courses: 5,
    image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const FeaturedInstructors = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Learn from Industry Experts
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our instructors are professionals working at top companies, sharing real-world 
            knowledge and practical skills that you can apply immediately.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {instructors.map((instructor, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden cursor-pointer"
            >
              <div className="relative">
                <img
                  src={instructor.image}
                  alt={instructor.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="text-sm font-semibold text-gray-900">{instructor.rating}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {instructor.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{instructor.role}</p>
                <p className="text-blue-600 font-medium mb-4">{instructor.speciality}</p>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {instructor.students.toLocaleString()} students
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {instructor.courses} courses
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            View All Instructors
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedInstructors;
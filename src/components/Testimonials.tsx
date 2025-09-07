import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alex Johnson',
    role: 'Software Developer',
    company: 'Microsoft',
    content: 'TutorFlow transformed my career completely. The courses are practical, up-to-date, and taught by industry professionals. I landed my dream job at Microsoft within 6 months of completing the full-stack development program.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'Maria Garcia',
    role: 'UX Designer',
    company: 'Airbnb',
    content: 'The design courses on TutorFlow are incredibly comprehensive. The instructors provide real-world projects that built my portfolio. The community support and feedback were invaluable throughout my learning journey.',
    rating: 5,
    image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    name: 'James Wilson',
    role: 'Digital Marketing Manager',
    company: 'Shopify',
    content: 'I went from knowing nothing about digital marketing to managing campaigns for a major e-commerce company. The step-by-step approach and hands-on projects made all the difference in my understanding.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories from Our Students
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of professionals who have transformed their careers through 
            our comprehensive online learning platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-6">
                <Quote className="h-8 w-8 text-blue-600 mb-4" />
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
            <Star className="h-5 w-5 text-yellow-500 fill-current mr-2" />
            <span className="font-semibold text-gray-900">4.9/5 average rating from 10,000+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
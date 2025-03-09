'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const testimonials = [
  {
    id: 1,
    quote: "JobPortal helped me find my dream job in just two weeks. The personalized job recommendations were spot on and the application process was seamless.",
    name: "Sarah Johnson",
    title: "Frontend Developer at TechCorp",
    avatar: "/images/avatars/sarah.jpg",
    rating: 5,
  },
  {
    id: 2,
    quote: "As an employer, I've had great success finding qualified candidates through JobPortal. The targeting options help us reach the right talent for our specialized roles.",
    name: "Michael Rodriguez",
    title: "HR Director at DataStream",
    avatar: "/images/avatars/michael.jpg",
    rating: 5,
  },
  {
    id: 3,
    quote: "The platform's user-friendly interface and real-time notifications kept me updated throughout my job search. Landed a great position that matched my career goals perfectly.",
    name: "Emily Chen",
    title: "Product Designer at DesignHub",
    avatar: "/images/avatars/emily.jpg",
    rating: 4,
  },
  {
    id: 4,
    quote: "JobPortal's analytics tools gave us valuable insights into our recruitment campaigns. We've significantly improved our hiring efficiency and quality of candidates.",
    name: "David Wilson",
    title: "Talent Acquisition Manager at CloudSolutions",
    avatar: "/images/avatars/david.jpg",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayCount = 2; // Number of testimonials to display at once
  
  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + displayCount >= testimonials.length ? 0 : prevIndex + displayCount
    );
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - displayCount < 0 ? Math.max(testimonials.length - displayCount, 0) : prevIndex - displayCount
    );
  };
  
  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + displayCount);
  
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {visibleTestimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="mr-4">
                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    layout="fill"
                    objectFit="cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`;
                    }}
                  />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.title}</p>
              </div>
            </div>
            
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i}
                  className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            
            <blockquote className="text-gray-700 dark:text-gray-300 italic">
              "{testimonial.quote}"
            </blockquote>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center mt-8 space-x-4">
        <button
          onClick={prevTestimonial}
          className="p-2 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Previous testimonial"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          onClick={nextTestimonial}
          className="p-2 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          aria-label="Next testimonial"
        >
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
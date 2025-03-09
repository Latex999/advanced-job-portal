'use client';

import {
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    id: 1,
    title: 'Create Account',
    description: 'Sign up and complete your profile with your skills, experience, and preferences.',
    icon: UserIcon,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 2,
    title: 'Find Jobs',
    description: 'Browse job listings or receive personalized job recommendations based on your profile.',
    icon: BriefcaseIcon,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 3,
    title: 'Apply',
    description: 'Submit your application with a tailored resume and cover letter for the desired position.',
    icon: DocumentTextIcon,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 4,
    title: 'Connect',
    description: 'Receive interview invitations and communicate directly with employers.',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-orange-100 text-orange-600',
  },
];

export default function HowItWorks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {steps.map((step) => (
        <div key={step.id} className="relative">
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center mb-4`}>
              <step.icon className="h-8 w-8" aria-hidden="true" />
            </div>
            <div className="h-12">
              <div className="absolute top-8 left-0 hidden lg:block w-full">
                {step.id < steps.length && (
                  <div className="h-0.5 w-full bg-gray-200 absolute top-8 left-[50%]" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
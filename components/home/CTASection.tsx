'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
          <p className="text-lg text-gray-100 mb-8 max-w-3xl mx-auto">
            Join thousands of job seekers and employers who use JobPortal to connect and advance their careers or find the perfect talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?type=jobseeker" className="btn-primary bg-white text-primary-700 hover:bg-gray-100">
              Sign Up as Job Seeker
            </Link>
            <Link href="/auth/register?type=employer" className="btn-primary border border-white bg-transparent hover:bg-primary-700">
              Sign Up as Employer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
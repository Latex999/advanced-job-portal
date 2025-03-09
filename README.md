# Advanced Job Portal

A comprehensive job portal system with advanced features for job seekers, employers, and administrators.

## Features

- **Authentication**
  - Email/password login and registration
  - OAuth integration (Google, LinkedIn)
  - Two-factor authentication
  - Password recovery

- **Role-Based Access Control**
  - Job Seekers: Browse jobs, apply, manage profile and applications
  - Employers: Post jobs, manage applications, company profile
  - Administrators: Manage users, jobs, and platform settings

- **Job Management**
  - Advanced job search with filters
  - Job recommendations based on user skills and preferences
  - Job applications with resume/CV upload
  - Job bookmarking

- **Company Profiles**
  - Detailed company pages
  - Company reviews and ratings
  - Follow companies for updates

- **Real-time Notifications**
  - Application status updates
  - New job matches
  - Interview invitations
  - Messages from employers/applicants

- **Messaging System**
  - Real-time chat between employers and applicants
  - Automated interview scheduling

- **Analytics**
  - Application tracking for job seekers
  - Recruitment analytics for employers
  - Platform usage statistics for administrators

- **Mobile Responsive Design**
  - Optimized experience across all devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: NextAuth.js, JWT
- **Real-time Features**: Socket.io
- **File Storage**: AWS S3
- **Deployment**: Vercel

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Latex999/advanced-job-portal.git
   cd advanced-job-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   AWS_BUCKET_NAME=your_s3_bucket_name
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Deployment

The application is configured for easy deployment to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure the environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.
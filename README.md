# Resumind - AI-Powered Resume Analyzer

<div align="center">

![Resumind](https://img.shields.io/badge/Resumind-AI%20Resume%20Analyzer-blue?style=for-the-badge)

**Smart feedback for your dream job!**

An intelligent resume analysis platform that provides comprehensive feedback, ATS optimization, and generates improved resume content tailored to specific job applications.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Usage](#-usage) • [Project Structure](#-project-structure)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

Resumind is a comprehensive resume analysis tool that leverages AI to help job seekers optimize their resumes for Applicant Tracking Systems (ATS) and specific job applications. The platform provides detailed feedback across multiple dimensions including ATS compatibility, content quality, structure, skills alignment, and tone.

### Key Capabilities

- **PDF Resume Analysis**: Extracts and analyzes text from multi-page PDF resumes
- **ATS Optimization**: Evaluates resume compatibility with Applicant Tracking Systems
- **Job-Specific Feedback**: Analyzes resume against specific job descriptions
- **Resume Improvement**: Generates improved, ATS-optimized resume content
- **Formatting Recommendations**: Provides tailored formatting tips based on resume length and job type
- **Resume Tracking**: Manage and track multiple resume submissions

## ✨ Features

### 📊 Comprehensive Resume Analysis

- **ATS Score**: Evaluates how well your resume can be parsed by ATS systems
- **Content Analysis**: Reviews work experience, education, and skills sections
- **Structure Evaluation**: Assesses resume organization and formatting
- **Tone & Style**: Analyzes professional tone and writing style
- **Skills Matching**: Compares your skills against job requirements

### 🚀 Resume Improvement

- **AI-Generated Improvements**: Get an improved version of your resume with specific content for each section
- **Content Preservation**: Maintains all valuable content while enhancing and optimizing
- **Section-by-Section Copy**: Easy copy-to-clipboard functionality for each resume section
- **Change Tracking**: Visual indicators show what's new vs. maintained from original

### 🎨 Formatting Tips

- **Tailored Recommendations**: Font, size, spacing, and margin suggestions based on:
  - Current resume page count
  - Target page count
  - Job type and industry
- **Industry-Specific Tips**: Formatting recommendations tailored to your field
- **ATS-Friendly Formatting**: Guidelines for optimal ATS compatibility

### 📁 Resume Management

- **Multiple Resumes**: Track resumes for different job applications
- **Resume History**: View all your analyzed resumes in one place
- **Quick Access**: Easy navigation between resume reviews and improvements

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **React Router 7** - Routing and navigation
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand** - State management

### PDF Processing
- **PDF.js** - PDF text extraction and rendering
- **Multi-page Support** - Analyzes all pages of your resume

### Backend & Storage
- **Puter.js** - Cloud storage and authentication
- **AI Integration** - GPT-powered analysis and improvement

### Development Tools
- **Vite** - Build tool and dev server
- **React Router Dev** - Development utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Puter.js account (for cloud storage and AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-resume-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file if needed
   # Configure Puter.js credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   ```text
   http://localhost:5173
   ```

## 📖 Usage

### 1. Upload Your Resume

- Navigate to the upload page
- Enter job details:
  - Company name
  - Job title
  - Job description
- Upload your resume PDF
- Click "Save & Analyze Resume"

### 2. Review Feedback

- View comprehensive feedback across multiple categories:
  - Overall score
  - ATS compatibility
  - Content quality
  - Structure
  - Skills alignment
  - Tone and style
- Each category includes specific tips and recommendations

### 3. Generate Improved Resume

- Click "Generate Improved Resume" from the feedback page
- Review the improved content with:
  - New/improved sections highlighted
  - Maintained content clearly marked
  - Formatting recommendations
- Copy sections individually to update your resume

### 4. Apply Formatting Tips

- Review tailored formatting recommendations:
  - Font family and sizes
  - Letter and line spacing
  - Margins
  - Page count recommendations
- Apply suggestions when building your resume

## 📁 Project Structure

```text
ai-resume-analyzer/
├── app/
│   ├── components/          # React components
│   │   ├── ResumeImprovement.tsx
│   │   ├── ResumeFormatTips.tsx
│   │   ├── Summary.tsx
│   │   ├── ATS.tsx
│   │   ├── Details.tsx
│   │   └── Footer.tsx
│   ├── lib/                 # Utilities and stores
│   │   ├── puter.ts         # Puter.js integration
│   │   ├── pdf2text.ts      # PDF text extraction
│   │   └── pdf2img.ts       # PDF to image conversion
│   ├── routes/              # Page routes
│   │   ├── home.tsx         # Dashboard
│   │   ├── upload.tsx       # Resume upload
│   │   ├── resume.tsx       # Resume review
│   │   └── improve.$id.tsx  # Resume improvement
│   ├── root.tsx             # Root layout
│   └── app.css              # Global styles
├── constants/
│   └── index.ts             # AI prompts and formats
├── types/
│   └── index.d.ts           # TypeScript definitions
├── public/                  # Static assets
└── package.json
```

## 💻 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- React Router for routing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👨‍💻 Developer

**Built by [YERO](https://github.com/yero)**

---

<div align="center">

Made with ❤️ by YERO

[Report Bug](https://github.com/yero/ai-resume-analyzer/issues) • [Request Feature](https://github.com/yero/ai-resume-analyzer/issues)

</div>

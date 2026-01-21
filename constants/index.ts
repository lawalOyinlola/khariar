export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "5",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "6",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
];

export const AIResponseFormat = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export const prepareInstructions = ({jobTitle, jobDescription}: { jobTitle: string; jobDescription: string; }) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      
      I am providing you with the TEXT CONTENT extracted from a PDF resume. Please carefully analyze the resume content and provide detailed feedback.
      
      IMPORTANT ANALYSIS GUIDELINES: 
      - Analyze the actual content, structure, formatting, and organization of the resume text
      - Consider ATS compatibility (how well the resume can be parsed by Applicant Tracking Systems)
      - Evaluate the resume against the target job description provided below
      - Pay attention to:
        * Contact information completeness and formatting
        * Professional summary or objective clarity
        * Work experience descriptions (quantified achievements, action verbs, relevance)
        * Education section completeness
        * Skills section (hard skills, soft skills, technical skills matching job requirements)
        * Keywords matching the job description
        * Overall structure and readability
        * Grammar, spelling, and professional tone
      - Be thorough and detailed in your analysis
      - Don't be afraid to point out mistakes or areas for improvement
      - If there is a lot to improve, don't hesitate to give low scores. This is to help the user improve their resume.
      - Consider all pages of the resume if it's a multi-page document
      
      TARGET JOB INFORMATION:
      - Job Title: ${jobTitle}
      - Job Description: ${jobDescription}
      
      Please analyze how well this resume matches the job requirements and provide specific, actionable feedback. Focus on:
      1. How well the resume content aligns with the job description
      2. Whether key skills and experiences from the job description are present
      3. The quality and impact of the content
      4. ATS optimization (keyword usage, formatting, structure)
      5. Overall professional presentation
      
      Provide the feedback using EXACTLY the following JSON format:
      ${AIResponseFormat}
      
      CRITICAL: Return ONLY the JSON object, without any markdown code blocks, without any explanatory text, and without any backticks. Just the raw JSON.`;

export const ImprovedResumeFormat = `
      interface ImprovedResume {
        contactInformation: {
          content: string; // Full contact section with name, email, phone, LinkedIn, etc.
          isNew: boolean; // true if this is new/improved content, false if maintained from original
          changes: string; // Brief description of what changed or "Maintained from original"
        };
        professionalSummary: {
          content: string; // Professional summary or objective
          isNew: boolean;
          changes: string;
        };
        workExperience: {
          items: {
            company: string;
            position: string;
            duration: string; // e.g., "Jan 2020 - Present"
            location?: string;
            description: string; // Bullet points or paragraph describing achievements
            isNew: boolean; // true if new position or significantly improved
            changes: string; // What was improved or "Maintained from original"
          }[];
        };
        education: {
          items: {
            institution: string;
            degree: string;
            fieldOfStudy?: string;
            duration: string; // e.g., "2016 - 2020"
            location?: string;
            achievements?: string; // GPA, honors, relevant coursework
            isNew: boolean;
            changes: string;
          }[];
        };
        skills: {
          technical: string[]; // Technical/hard skills
          soft: string[]; // Soft skills
          certifications?: string[]; // Certifications if any
          isNew: boolean; // true if skills section was significantly updated
          changes: string; // What skills were added/removed/improved
        };
        additionalSections?: {
          // Optional sections like Projects, Awards, Publications, etc.
          [sectionName: string]: {
            items: {
              title: string;
              description: string;
              isNew: boolean;
              changes: string;
            }[];
          };
        };
        summary: {
          overallImprovements: string[]; // List of key improvements made
          atsOptimization: string[]; // ATS-specific improvements
          keywordsAdded: string[]; // Keywords from job description that were added
        };
        formattingTips: {
          fontFamily: string; // Recommended font (e.g., "Calibri", "Arial", "Times New Roman", "Georgia")
          fontSize: {
            headings: string; // Font size for headings (e.g., "14-16pt")
            body: string; // Font size for body text (e.g., "10-11pt", "11-12pt")
            name: string; // Font size for name (e.g., "18-22pt")
          };
          fontWeight: {
            headings: string; // Font weight for headings (e.g., "Bold", "Semi-bold")
            body: string; // Font weight for body text (e.g., "Regular", "Normal")
            name: string; // Font weight for name (e.g., "Bold")
          };
          letterSpacing: string; // Letter spacing recommendation (e.g., "Normal", "0.5pt", "Tight")
          lineSpacing: string; // Line spacing recommendation (e.g., "1.0", "1.15", "Single")
          margins: string; // Margin recommendations (e.g., "0.5-0.75 inches on all sides")
          pageCount: {
            current: number; // Current page count of original resume
            recommended: number; // Recommended page count
            reasoning: string; // Explanation for page count recommendation
          };
          essentialTips: string[]; // Essential formatting tips tailored to this resume and job
          industrySpecific: string[]; // Industry/job-specific formatting recommendations
        };
      }`;

export const prepareImprovementInstructions = ({
  jobTitle,
  jobDescription,
  feedback,
  pageCount,
}: {
  jobTitle: string;
  jobDescription: string;
  feedback: Feedback;
  pageCount?: number;
}) => `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

TASK: Generate an improved, ATS-optimized resume based on the original resume content, job requirements, and feedback provided.

CONTEXT:
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}
- Current Resume Length: ${pageCount || "Unknown"} page(s)

FEEDBACK ANALYSIS:
${JSON.stringify(feedback, null, 2)}

CRITICAL REQUIREMENTS:
1. PRESERVE ALL VALID CONTENT: Keep all good content from the original resume. Only improve, enhance, or add - never remove valuable information unless it's clearly irrelevant or harmful.

2. ATS OPTIMIZATION:
   - Use standard section headings (e.g., "Work Experience", "Education", "Skills")
   - Include relevant keywords from the job description naturally
   - Use standard date formats (MMM YYYY - MMM YYYY)
   - Avoid graphics, tables, or complex formatting
   - Use bullet points for achievements
   - Quantify achievements with numbers, percentages, or metrics

3. CONTENT IMPROVEMENTS:
   - Address all "improve" type feedback from the analysis
   - Enhance work experience descriptions with action verbs and quantified achievements
   - Ensure skills section matches job requirements
   - Improve professional summary to align with job description
   - Fix any grammar, spelling, or tone issues

4. STRUCTURE:
   - Organize content in standard resume sections
   - Maintain chronological order for work experience and education
   - Use consistent formatting throughout

5. HIGHLIGHTING:
   - Mark new content with isNew: true
   - Mark maintained content with isNew: false
   - Provide clear descriptions of changes in the "changes" field

6. COMPLETENESS:
   - Include ALL sections from the original resume
   - Add any missing critical sections (contact info, summary, etc.)
   - Ensure the resume is complete and ready to use

7. FORMATTING TIPS (CRITICAL - Tailor based on resume length and job type):
   - Analyze the current resume length (${pageCount || "unknown"} page(s))
   - Determine optimal page count based on experience level and industry standards:
     * Entry-level: 1 page
     * Mid-level: 1-2 pages
     * Senior/Executive: 2-3 pages
   - Font recommendations based on job type:
     * Creative fields (Design, Marketing, etc.): Modern fonts like Calibri, Arial, or Helvetica
     * Traditional fields (Finance, Law, Academia): Professional fonts like Times New Roman, Georgia, or Garamond
     * Tech fields: Clean, readable fonts like Calibri, Arial, or Verdana
   - Font size recommendations:
     * If resume is ${pageCount ? (pageCount > 2 ? "3+ pages and needs to be condensed" : pageCount === 2 ? "2 pages and could fit on 1-2 pages" : "1 page") : "standard length"}: Suggest appropriate font sizes
     * If reducing pages: Suggest slightly smaller fonts (10-11pt body, 14pt headings)
     * If has space: Suggest standard fonts (11-12pt body, 16pt headings)
   - Letter spacing: Normal for most resumes, slightly tighter if condensing
   - Line spacing: 1.0-1.15 for most resumes, tighter if condensing
   - Margins: 0.5-0.75 inches standard, can go to 0.5 inches if condensing
   - Provide industry-specific formatting tips based on the job title and description
   - Include essential ATS-friendly formatting tips

Generate the improved resume using EXACTLY the following JSON format:
${ImprovedResumeFormat}

CRITICAL: Return ONLY the JSON object, without any markdown code blocks, without any explanatory text, and without any backticks. Just the raw JSON.`;

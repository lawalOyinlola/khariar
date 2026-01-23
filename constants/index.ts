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

/**
 * Determines recommended page count based on experience level and industry standards
 */
export const getRecommendedPageCount = (
  pageCount: number,
  experienceLevel?: "entry" | "mid" | "senior" | "executive" | "academic" | "federal"
): { recommended: number; reasoning: string; isAppropriate: boolean } => {
  // Default to mid-level if not specified
  const level = experienceLevel || "mid";
  
  const standards = {
    entry: { min: 1, max: 1, ideal: 1 },
    mid: { min: 1, max: 2, ideal: 2 },
    senior: { min: 2, max: 3, ideal: 2 },
    executive: { min: 2, max: 3, ideal: 3 },
    academic: { min: 3, max: 10, ideal: 5 },
    federal: { min: 2, max: 5, ideal: 3 },
  };

  const standard = standards[level];
  const isAppropriate = pageCount >= standard.min && pageCount <= standard.max;
  
  let reasoning = "";
  if (isAppropriate) {
    if (pageCount === standard.ideal) {
      reasoning = `Your ${pageCount}-page resume is ideal for ${level}-level positions. This length allows you to showcase your experience without overwhelming recruiters.`;
    } else if (pageCount < standard.ideal) {
      reasoning = `Your ${pageCount}-page resume is within acceptable range for ${level}-level positions (${standard.min}-${standard.max} pages). Consider adding more quantified achievements if you have space.`;
    } else {
      reasoning = `Your ${pageCount}-page resume is acceptable for ${level}-level positions but could potentially be condensed to ${standard.ideal} pages for optimal impact.`;
    }
  } else {
    if (pageCount < standard.min) {
      reasoning = `Your ${pageCount}-page resume is shorter than recommended for ${level}-level positions (${standard.min}-${standard.max} pages). Consider expanding key sections with more detailed achievements and quantifiable results.`;
    } else {
      reasoning = `Your ${pageCount}-page resume exceeds the recommended length for ${level}-level positions (${standard.max} pages max). Recruiters typically spend 6-10 seconds on initial review, so consider condensing to ${standard.ideal}-${standard.max} pages by removing outdated or less relevant information.`;
    }
  }

  return {
    recommended: standard.ideal,
    reasoning,
    isAppropriate,
  };
};

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
  pageCount,
}: {
  jobTitle: string;
  jobDescription: string;
  pageCount?: number;
}) =>
  `You are an expert in ATS (Applicant Tracking System) and resume analysis.
      
      I am providing you with the TEXT CONTENT extracted from a PDF resume. Please carefully analyze the resume content and provide detailed feedback.
      
      RESUME PAGE COUNT INFORMATION:
      - Current Resume Length: ${pageCount !== undefined ? `${pageCount} page(s)` : "Unknown (analyze from content)"}
      
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
        * **RESUME LENGTH AND PAGE COUNT** (CRITICAL - see detailed guidelines below)
      - Be thorough and detailed in your analysis
      - Don't be afraid to point out mistakes or areas for improvement
      - If there is a lot to improve, don't hesitate to give low scores. This is to help the user improve their resume.
      - Consider all pages of the resume if it's a multi-page document
      
      RESUME PAGE LENGTH ANALYSIS (CRITICAL SECTION):
      Analyze the resume's page count and provide specific feedback in the "structure" section. Follow these industry standards:
      
      1. DETERMINE EXPERIENCE LEVEL from the resume content:
         - Entry-level (0-3 years): Recent graduates, career changers, first job seekers
         - Mid-level (3-10 years): Professionals with several years of experience
         - Senior (10-15 years): Experienced professionals with leadership roles
         - Executive (15+ years): C-suite, VP-level, or extensive leadership experience
         - Academic: Research positions, professorships, PhD candidates (publications, research)
         - Federal/Government: Government positions (may require longer format)
      
      2. PAGE COUNT STANDARDS BY EXPERIENCE LEVEL:
         - Entry-level: 1 page (STRICT - should never exceed 1 page)
         - Mid-level: 1-2 pages (ideal: 2 pages if you have 5+ years)
         - Senior: 2-3 pages (ideal: 2 pages, max 3 only if extensive leadership)
         - Executive: 2-3 pages (acceptable up to 3 pages for C-suite roles)
         - Academic: 3-10+ pages (acceptable due to publications, research, grants)
         - Federal/Government: 2-5 pages (follow specific format requirements)
      
      3. EVALUATION CRITERIA:
         - If resume is TOO LONG (>3 pages for non-academic/federal):
           * Deduct points in "structure" section (reduce score by 10-20 points)
           * Provide specific tips on what to remove or condense
           * Explain that recruiters spend only 6-10 seconds on initial review
           * Suggest removing outdated roles (>10 years old unless highly relevant)
           * Recommend consolidating similar positions
           * Suggest removing irrelevant sections or excessive detail
         
         - If resume is TOO SHORT (<1 page for mid-level+):
           * Deduct points in "content" section (reduce score by 5-15 points)
           * Suggest expanding key sections with quantified achievements
           * Recommend adding more detail to work experience
           * Suggest including relevant projects, certifications, or additional sections
         
         - If resume length is APPROPRIATE:
           * Acknowledge this positively in "structure" tips
           * Provide tips on optimizing content density
           * Suggest ways to maximize impact within the current length
      
      4. EXCEPTIONS TO STANDARD RULES:
         - Academic positions: Longer CVs (3-10+ pages) are acceptable and expected
         - Federal/Government jobs: May require longer formats (check job posting)
         - International applications: Some regions (Europe, Asia) expect longer CVs
         - Technical roles: May justify 2-3 pages for detailed project descriptions
         - Creative portfolios: Length varies, focus on quality over page count
      
      5. ACTIONABLE FEEDBACK REQUIREMENTS:
         When providing feedback on page length, be specific:
         - If too long: List specific sections or content to remove/condense
         - If too short: Suggest specific sections to expand
         - Always explain WHY the length matters (recruiter attention span, ATS optimization)
         - Provide concrete examples of what to add or remove
         - Consider the job type and industry when making recommendations
      
      TARGET JOB INFORMATION:
      - Job Title: ${jobTitle}
      - Job Description: ${jobDescription}
      
      Please analyze how well this resume matches the job requirements and provide specific, actionable feedback. Focus on:
      1. How well the resume content aligns with the job description
      2. Whether key skills and experiences from the job description are present
      3. The quality and impact of the content
      4. ATS optimization (keyword usage, formatting, structure)
      5. Overall professional presentation
      6. **Resume page length appropriateness** (include specific feedback in "structure" section)
      
      Provide the feedback using EXACTLY the following JSON format:
      ${AIResponseFormat}
      
      CRITICAL: Return ONLY the JSON object, without any markdown code blocks, without any explanatory text, and without any backticks. Just the raw JSON.`;

export const prepareSampleResumeInstructions = ({
  jobTitle,
  jobDescription,
  companyName,
}: {
  jobTitle: string;
  jobDescription: string;
  companyName: string;
}) => `You are an expert resume writer and ATS (Applicant Tracking System) optimization specialist.

TASK: Generate a professional, ATS-optimized sample resume template tailored specifically for the job application below.

JOB INFORMATION:
- Company: ${companyName}
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}

REQUIREMENTS:
1. Create a complete, professional resume template with placeholder content
2. Structure should include (ALL SECTIONS ARE REQUIRED):
   - Contact Information section (with placeholders for name, email, phone, LinkedIn, location)
   - Professional Summary (tailored to the job, with placeholders)
   - Work Experience (2-3 sample positions with placeholder company names, dates, and achievements)
   - Education (sample degree with placeholders)
   - Skills section (MANDATORY - include relevant skills from the job description, use placeholders if needed)
   - Optional: Certifications, Projects, or other relevant sections
   
   CRITICAL: The Skills section is REQUIRED and must never be omitted. Always include at least 5-8 relevant skills based on the job description.

3. SKILLS AND CERTIFICATIONS SECTION (Follow these rules):
   - For entry to mid-level resumes (1-2 pages), typically use:
     * If skills are generic/core: Use "allSkills" array with sectionName: "Skills" or "Core Skills"
     * If skills benefit from splitting: Use "technical" and "soft" arrays with sectionName: "Skills"
   - For certifications in sample templates (typically 1-2 pages):
     * Place certifications WITHIN the skills section (set sectionName to "Skills and Certifications" if certifications exist)
     * Set certificationsInSeparateSection: false
     * Include certifications in skills.certifications array
     * DO NOT create a separate "Certifications" section in additionalSections
   - NEVER duplicate certifications - they should appear only in skills.certifications

3. ATS OPTIMIZATION:
   - Use standard section headings (e.g., "Work Experience", "Education", "Skills")
   - Include relevant keywords from the job description naturally
   - Use standard date formats (MMM YYYY - MMM YYYY)
   - Use bullet points for achievements
   - Include quantifiable achievements (with placeholder numbers/metrics)

4. CONTENT GUIDELINES:
   - Make it entry to mid-level appropriate (1-2 pages ideal)
   - Include placeholder text that users can easily replace
   - Use [YOUR NAME], [YOUR EMAIL], [COMPANY NAME], etc. as placeholders
   - Make achievements relevant to the job description
   - Include action verbs and professional language

5. FORMATTING:
   - Professional and clean structure
   - Easy to edit and customize
   - ATS-friendly formatting

Generate the sample resume using EXACTLY the following JSON format:
${ImprovedResumeFormat}

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
          technical?: string[]; // Technical/hard skills (use when skills need splitting)
          soft?: string[]; // Soft skills (use when skills need splitting)
          allSkills?: string[]; // All skills in one array (use when splitting isn't needed - generic/core skills)
          sectionName?: string; // Section name: "Skills", "Core Skills", or "Skills and Certifications" (default: "Skills")
          certifications?: string[]; // Certifications - place here OR in additionalSections based on page count
          certificationsInSeparateSection?: boolean; // true if certifications should be in additionalSections (use when page count allows)
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
   - CRITICAL: ALWAYS include a skills section - it is REQUIRED and must never be omitted
   - Ensure skills section matches job requirements and includes relevant skills from the job description
   - If the original resume has no skills, extract skills from work experience, education, and job description
   - Improve professional summary to align with job description
   - Fix any grammar, spelling, or tone issues

4. SKILLS AND CERTIFICATIONS SECTION (CRITICAL - Follow these rules to avoid duplication):
   
   SKILLS SECTION STRUCTURE:
   - If the resume has a mix of technical and soft skills that benefit from separation:
     * Use "technical" and "soft" arrays
     * Set sectionName to "Skills" (default)
   - If the resume has generic/core skills that don't need splitting:
     * Use "allSkills" array (single unified list)
     * Set sectionName to "Skills" or "Core Skills" (choose based on context)
   - DO NOT use both "technical/soft" AND "allSkills" - choose one approach
   
   CERTIFICATIONS PLACEMENT (Based on page count and space - CRITICAL: NO DUPLICATION):
   - Current resume length: ${pageCount !== undefined ? `${pageCount} page(s)` : "Analyze from content"}
   - If resume is SHORT (1 page or needs condensing):
     * Place certifications WITHIN the skills section ONLY
     * Set sectionName to "Skills and Certifications" if certifications exist
     * Set certificationsInSeparateSection: false
     * Include certifications in the skills.certifications array
     * DO NOT create a separate "Certifications" section in additionalSections
     * VERIFY: certifications appear ONLY in skills.certifications, NOT in additionalSections
   
   - If resume has ADEQUATE SPACE (2+ pages, not exceeding recommended length):
     * Place certifications in a SEPARATE "Certifications" section in additionalSections ONLY
     * Set certificationsInSeparateSection: true
     * Leave skills.certifications empty or undefined (DO NOT include certifications here)
     * Create a "Certifications" entry in additionalSections with items for each certification
     * Each certification item should have: title (certification name), description (issuing organization, date if relevant)
     * VERIFY: certifications appear ONLY in additionalSections["Certifications"], NOT in skills.certifications
   
   - CRITICAL RULE - NEVER DUPLICATE:
     * Certifications must appear in EXACTLY ONE place:
       - EITHER in skills.certifications (when space is limited), OR
       - OR in additionalSections["Certifications"] (when space allows)
     * BUT NEVER IN BOTH PLACES
     * Before finalizing, check that each certification appears only once in the entire resume
   
   - Section naming:
     * If certifications are in skills section: Use "Skills and Certifications" as sectionName
     * If certifications are separate: Use "Skills" or "Core Skills" as sectionName

5. STRUCTURE:
   - Organize content in standard resume sections
   - Maintain chronological order for work experience and education
   - Use consistent formatting throughout
   - Avoid duplication of certifications (see skills section rules above)

6. HIGHLIGHTING:
   - Mark new content with isNew: true
   - Mark maintained content with isNew: false
   - Provide clear descriptions of changes in the "changes" field

7. COMPLETENESS (CRITICAL - ALL SECTIONS REQUIRED):
   - Include ALL sections from the original resume
   - Add any missing critical sections (contact info, summary, etc.)
   - SKILLS SECTION IS MANDATORY - must always be included, even if minimal
   - If original resume has no skills section, create one by:
     * Extracting skills from work experience descriptions
     * Extracting skills from education/certifications
     * Including relevant skills from the job description
     * Using generic/core skills if specific skills aren't available
   - Ensure the resume is complete and ready to use
   - Ensure certifications appear exactly once (either in skills or separate section)
   - Never omit the skills section - it is a standard resume requirement

8. FORMATTING TIPS (CRITICAL - Tailor based on resume length, experience level, and job type):
   
   PAGE COUNT ANALYSIS AND RECOMMENDATIONS:
   - Current resume length: ${pageCount !== undefined ? `${pageCount} page(s)` : "Analyze from content"}
   - First, determine the candidate's experience level from the resume content:
     * Entry-level (0-3 years): Recent graduates, career changers, first job seekers
     * Mid-level (3-10 years): Professionals with several years of experience
     * Senior (10-15 years): Experienced professionals with leadership roles
     * Executive (15+ years): C-suite, VP-level, or extensive leadership experience
     * Academic: Research positions, professorships, PhD candidates (publications, research)
     * Federal/Government: Government positions (may require longer format)
   
   - Apply industry-standard page count recommendations:
     * Entry-level: 1 page (STRICT - should never exceed 1 page)
     * Mid-level: 1-2 pages (ideal: 2 pages if 5+ years of experience)
     * Senior: 2-3 pages (ideal: 2 pages, max 3 only if extensive leadership)
     * Executive: 2-3 pages (acceptable up to 3 pages for C-suite roles)
     * Academic: 3-10+ pages (acceptable due to publications, research, grants)
     * Federal/Government: 2-5 pages (follow specific format requirements)
   
   - For the formattingTips.pageCount section, provide:
     * current: ${pageCount !== undefined ? pageCount : "the actual page count from the original resume"}
     * recommended: The ideal page count based on experience level (use the standards above)
     * reasoning: A detailed explanation that:
       - States whether the current length is appropriate, too long, or too short
       - Explains WHY the recommended length matters (recruiter attention span, ATS optimization)
       - If too long: Provides specific guidance on what to condense or remove
       - If too short: Suggests what sections could be expanded
       - If appropriate: Acknowledges this and provides optimization tips
       - Considers any exceptions (academic, federal, international, technical roles)
       - Be specific and actionable (e.g., "Your 4-page resume exceeds the 2-page ideal for mid-level positions. Consider removing roles older than 10 years unless highly relevant, consolidating similar positions, and reducing bullet points per role to 3-4 most impactful achievements.")
   
   TYPOGRAPHY RECOMMENDATIONS:
   - Font recommendations based on job type:
     * Creative fields (Design, Marketing, etc.): Modern fonts like Calibri, Arial, or Helvetica
     * Traditional fields (Finance, Law, Academia): Professional fonts like Times New Roman, Georgia, or Garamond
     * Tech fields: Clean, readable fonts like Calibri, Arial, or Verdana
   
   - Font size recommendations (tailor based on page count goals):
     * If resume needs to be condensed (current > recommended): Suggest slightly smaller fonts (10-11pt body, 14pt headings, 18pt name) to fit more content
     * If resume has appropriate length: Suggest standard fonts (11-12pt body, 16pt headings, 20pt name)
     * If resume is too short: Suggest standard or slightly larger fonts (11-12pt body, 16pt headings, 20pt name) to fill space effectively
   
   - Letter spacing: Normal for most resumes, slightly tighter (0.5pt) if condensing
   - Line spacing: 1.0-1.15 for most resumes, tighter (0.95-1.0) if condensing, standard (1.15) if has space
   - Margins: 0.5-0.75 inches standard, can go to 0.5 inches if condensing, 0.75 inches if has space
   
   ESSENTIAL AND INDUSTRY-SPECIFIC TIPS:
   - Provide 3-5 essential ATS-friendly formatting tips tailored to this resume and job
   - Include 2-4 industry/job-specific formatting recommendations based on the job title and description
   - Consider the page count recommendations when suggesting formatting adjustments
   - If page count needs reduction, include tips on condensing content (e.g., "Use concise bullet points", "Remove redundant information", "Combine similar roles")
   - If page count is appropriate, focus on optimization tips (e.g., "Maintain consistent formatting", "Use white space effectively", "Ensure readability")

Generate the improved resume using EXACTLY the following JSON format:
${ImprovedResumeFormat}

CRITICAL: Return ONLY the JSON object, without any markdown code blocks, without any explanatory text, and without any backticks. Just the raw JSON.`;

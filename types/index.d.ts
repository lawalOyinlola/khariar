interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation?: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
}

interface ImprovedResume {
    contactInformation: {
        content: string;
        isNew: boolean;
        changes: string;
    };
    professionalSummary: {
        content: string;
        isNew: boolean;
        changes: string;
    };
    workExperience: {
        items: {
            company: string;
            position: string;
            duration: string;
            location?: string;
            description: string;
            isNew: boolean;
            changes: string;
        }[];
    };
    education: {
        items: {
            institution: string;
            degree: string;
            fieldOfStudy?: string;
            duration: string;
            location?: string;
            achievements?: string;
            isNew: boolean;
            changes: string;
        }[];
    };
    skills: {
        technical: string[];
        soft: string[];
        certifications?: string[];
        isNew: boolean;
        changes: string;
    };
    additionalSections?: {
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
        overallImprovements: string[];
        atsOptimization: string[];
        keywordsAdded: string[];
    };
    formattingTips: {
        fontFamily: string;
        fontSize: {
            headings: string;
            body: string;
            name: string;
        };
        fontWeight: {
            headings: string;
            body: string;
            name: string;
        };
        letterSpacing: string;
        lineSpacing: string;
        margins: string;
        pageCount: {
            current: number;
            recommended: number;
            reasoning: string;
        };
        essentialTips: string[];
        industrySpecific: string[];
    };
}

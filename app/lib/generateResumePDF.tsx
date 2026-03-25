import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

interface PDFResumeData {
  contactInformation: string;
  professionalSummary: string;
  workExperience: {
    company: string;
    position: string;
    duration: string;
    location?: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    duration: string;
    location?: string;
    achievements?: string;
  }[];
  skills: {
    technical?: string[];
    soft?: string[];
    allSkills?: string[];
    sectionName?: string;
    certifications?: string[];
    certificationsInSeparateSection?: boolean;
  };
  additionalSections?: {
    [sectionName: string]: {
      title: string;
      description: string;
    }[];
  };
  formattingTips?: {
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
    margins: string;
  };
}

// Helper functions to parse formatting
const parseFontSize = (sizeStr: string, defaultSize: number = 12): number => {
  const match = sizeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : defaultSize;
};

const parseMargin = (marginStr: string, defaultMargin: number = 0.75): number => {
  const match = marginStr.match(/(\d+\.?\d*)/);
  if (match) {
    return parseFloat(match[1]) * 72; // Convert inches to points
  }
  return defaultMargin * 72;
};

const createStyles = (formattingTips?: PDFResumeData["formattingTips"]) => {
  const nameSize = formattingTips
    ? parseFontSize(formattingTips.fontSize.name, 20)
    : 20;
  const headingSize = formattingTips
    ? parseFontSize(formattingTips.fontSize.headings, 14)
    : 14;
  const bodySize = formattingTips
    ? parseFontSize(formattingTips.fontSize.body, 11)
    : 11;
  const margin = formattingTips ? parseMargin(formattingTips.margins, 0.75) : 54;

  const fontFamily =
    formattingTips?.fontFamily === "Times New Roman"
      ? "Times-Roman"
      : formattingTips?.fontFamily === "Arial" ||
        formattingTips?.fontFamily === "Calibri"
        ? "Helvetica"
        : "Helvetica";

  return StyleSheet.create({
    page: {
      paddingTop: margin,
      paddingBottom: margin,
      paddingLeft: margin,
      paddingRight: margin,
      fontFamily: fontFamily,
      fontSize: bodySize,
      lineHeight: 1.5,
    },
    name: {
      fontSize: nameSize,
      fontWeight: formattingTips?.fontWeight.name === "Bold" ? "bold" : "normal",
      marginBottom: 8,
      textAlign: "center",
    },
    section: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: headingSize,
      fontWeight: "bold",
      marginBottom: 6,
      borderBottomWidth: 1,
      borderBottomColor: "#000000",
      paddingBottom: 2,
    },
    contactInfo: {
      fontSize: bodySize,
      textAlign: "center",
      marginBottom: 12,
      lineHeight: 1.4,
    },
    summary: {
      fontSize: bodySize,
      marginBottom: 12,
      lineHeight: 1.5,
      textAlign: "justify",
    },
    workItem: {
      marginBottom: 10,
    },
    workHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    workTitle: {
      fontSize: bodySize + 1,
      fontWeight: "bold",
    },
    workCompany: {
      fontSize: bodySize,
      fontWeight: "bold",
    },
    workDuration: {
      fontSize: bodySize - 1,
      color: "#666666",
    },
    workLocation: {
      fontSize: bodySize - 1,
      color: "#666666",
    },
    workDescription: {
      fontSize: bodySize,
      marginTop: 4,
      lineHeight: 1.4,
      paddingLeft: 8,
    },
    educationItem: {
      marginBottom: 8,
    },
    educationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    educationDegree: {
      fontSize: bodySize + 1,
      fontWeight: "bold",
    },
    educationInstitution: {
      fontSize: bodySize,
      fontWeight: "bold",
    },
    educationDetails: {
      fontSize: bodySize - 1,
      color: "#666666",
      marginTop: 2,
    },
    skillsContainer: {
      marginBottom: 8,
    },
    skillsList: {
      fontSize: bodySize,
      lineHeight: 1.6,
      paddingLeft: 8,
    },
    bulletPoint: {
      marginBottom: 2,
    },
  });
};

// Convert ImprovedResume to PDFResumeData
export const convertToPDFData = (
  improvedResume: ImprovedResume
): PDFResumeData => {
  // Ensure skills section exists - if missing, create a minimal one
  const skills = improvedResume.skills || {
    allSkills: ["Skills section missing - please add relevant skills"],
  };

  return {
    contactInformation: improvedResume.contactInformation.content,
    professionalSummary: improvedResume.professionalSummary.content,
    workExperience: improvedResume.workExperience.items.map((item) => ({
      company: item.company,
      position: item.position,
      duration: item.duration,
      location: item.location,
      description: item.description,
    })),
    education: improvedResume.education.items.map((item) => ({
      institution: item.institution,
      degree: item.degree,
      fieldOfStudy: item.fieldOfStudy,
      duration: item.duration,
      location: item.location,
      achievements: item.achievements,
    })),
    skills: {
      technical: skills.technical || [],
      soft: skills.soft || [],
      allSkills: skills.allSkills || [],
      sectionName: skills.sectionName || "Skills",
      certifications: skills.certifications,
      certificationsInSeparateSection: skills.certificationsInSeparateSection || false,
    },
    additionalSections: improvedResume.additionalSections
      ? Object.entries(improvedResume.additionalSections).reduce(
        (acc, [key, section]) => {
          acc[key] = section.items.map((item) => ({
            title: item.title,
            description: item.description,
          }));
          return acc;
        },
        {} as { [key: string]: { title: string; description: string }[] }
      )
      : undefined,
    formattingTips: improvedResume.formattingTips,
  };
};

// Extract name from contact information (first line usually)
const extractName = (contactInfo: string): string => {
  const lines = contactInfo.split("\n").filter((line) => line.trim());
  const firstLine = lines[0]?.trim() || "Resume";

  // If it's a single line with '|' separator, extract first segment
  if (lines.length === 1 && firstLine.includes("|")) {
    return firstLine.split("|")[0]?.trim() || "Resume";
  }

  return firstLine;
};

// Parse description into bullet points
const parseDescription = (description: string): string[] => {
  // Split by newlines, bullets, or dashes
  return description
    .split(/\n|•|-\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.match(/^---/)); // Filter out page separators
};

// Create the PDF Document component
const ResumePDFDocument = ({ data }: { data: PDFResumeData }) => {
  const styles = createStyles(data.formattingTips);
  const name = extractName(data.contactInformation);

  // Handle contact lines: detect single-line vs multi-line format
  const trimmedContactInfo = data.contactInformation.trim();
  const isSingleLine = !trimmedContactInfo.includes("\n");

  let contactLines: string[];
  if (isSingleLine && trimmedContactInfo.includes("|")) {
    // Single line with '|' separator: split and filter out the name segment
    const segments = trimmedContactInfo
      .split("|")
      .map((seg) => seg.trim())
      .filter((seg) => seg && seg !== name);
    contactLines = segments;
  } else {
    // Multi-line format: split by newlines and filter out lines that exactly match the name
    // Only exclude the first line if it exactly matches the name (common format)
    const lines = trimmedContactInfo.split("\n").map((line) => line.trim());
    const firstLine = lines[0];

    // Exclude first line only if it exactly matches the name (case-insensitive)
    // This prevents accidentally removing legitimate contact info that contains the name
    if (firstLine && firstLine.toLowerCase() === name.toLowerCase()) {
      contactLines = lines.slice(1).filter((line) => line.length > 0);
    } else {
      // Filter out any lines that exactly match the name (case-insensitive)
      contactLines = lines.filter(
        (line) => line.length > 0 && line.toLowerCase() !== name.toLowerCase()
      );
    }
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Name */}
        <Text style={styles.name}>{name}</Text>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.contactInfo}>{contactLines.join(" | ")}</Text>
        </View>

        {/* Professional Summary */}
        {data.professionalSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.professionalSummary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {data.workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.workExperience.map((work, idx) => (
              <View key={idx} style={styles.workItem}>
                <View style={styles.workHeader}>
                  <View>
                    <Text style={styles.workTitle}>{work.position}</Text>
                    <Text style={styles.workCompany}>{work.company}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.workDuration}>{work.duration}</Text>
                    {work.location && (
                      <Text style={styles.workLocation}>{work.location}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.workDescription}>
                  {parseDescription(work.description).map((bullet, bulletIdx) => (
                    <Text key={bulletIdx} style={styles.bulletPoint}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <View>
                    <Text style={styles.educationDegree}>
                      {edu.degree}
                      {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                    </Text>
                    <Text style={styles.educationInstitution}>
                      {edu.institution}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.educationDetails}>{edu.duration}</Text>
                    {edu.location && (
                      <Text style={styles.educationDetails}>{edu.location}</Text>
                    )}
                  </View>
                </View>
                {edu.achievements && (
                  <Text style={styles.educationDetails}>{edu.achievements}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {data.skills.sectionName || "Skills"}
            </Text>
            {data.skills.allSkills && data.skills.allSkills.length > 0 ? (
              // Unified skills display
              <View style={styles.skillsContainer}>
                <Text style={styles.skillsList}>
                  {data.skills.allSkills.join(", ")}
                </Text>
              </View>
            ) : (
              // Split skills display
              <>
                {data.skills.technical && data.skills.technical.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                      Technical Skills:
                    </Text>
                    <Text style={styles.skillsList}>
                      {data.skills.technical.join(", ")}
                    </Text>
                  </View>
                )}
                {data.skills.soft && data.skills.soft.length > 0 && (
                  <View style={styles.skillsContainer}>
                    <Text
                      style={{ fontWeight: "bold", marginBottom: 4, marginTop: 6 }}
                    >
                      Soft Skills:
                    </Text>
                    <Text style={styles.skillsList}>
                      {data.skills.soft.join(", ")}
                    </Text>
                  </View>
                )}
                {/* Fallback if no skills at all */}
                {(!data.skills.technical || data.skills.technical.length === 0) &&
                  (!data.skills.soft || data.skills.soft.length === 0) && (
                    <View style={styles.skillsContainer}>
                      <Text style={styles.skillsList}>
                        Skills section needs to be populated with relevant skills
                      </Text>
                    </View>
                  )}
              </>
            )}
            {/* Show certifications in skills section only if not in separate section */}
            {data.skills.certifications &&
              data.skills.certifications.length > 0 &&
              !data.skills.certificationsInSeparateSection && (
                <View style={styles.skillsContainer}>
                  <Text
                    style={{ fontWeight: "bold", marginBottom: 4, marginTop: 6 }}
                  >
                    Certifications:
                  </Text>
                  <Text style={styles.skillsList}>
                    {data.skills.certifications.join(", ")}
                  </Text>
                </View>
              )}
          </View>
        )}

        {/* Additional Sections */}
        {data.additionalSections &&
          Object.entries(data.additionalSections).map(([sectionName, items]) => (
            <View key={sectionName} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {sectionName
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </Text>
              {items.map((item, idx) => (
                <View key={idx} style={styles.workItem}>
                  <Text style={styles.workTitle}>{item.title}</Text>
                  <View style={styles.workDescription}>
                    {parseDescription(item.description).map(
                      (bullet, bulletIdx) => (
                        <Text key={bulletIdx} style={styles.bulletPoint}>
                          • {bullet}
                        </Text>
                      )
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
      </Page>
    </Document>
  );
};

// Generate PDF blob from ImprovedResume data
export const generateResumePDF = async (
  improvedResume: ImprovedResume,
  fileName: string = "improved-resume.pdf"
): Promise<Blob> => {
  const pdfData = convertToPDFData(improvedResume);
  // Create the document element using JSX
  const doc = <ResumePDFDocument data={pdfData} />;
  const blob = await pdf(doc).toBlob();
  return blob;
};

// Download PDF helper
export const downloadResumePDF = async (
  improvedResume: ImprovedResume,
  fileName: string = "improved-resume.pdf"
): Promise<void> => {
  try {
    const blob = await generateResumePDF(improvedResume, fileName);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw error;
  }
};

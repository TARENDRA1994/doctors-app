const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak, Table, TableRow, TableCell, WidthType, BorderStyle } = require('docx');

// Helper to create a heading
const createHeading = (text, level = HeadingLevel.HEADING_1) => {
    return new Paragraph({
        text: text,
        heading: level,
        spacing: { before: 400, after: 200 }
    });
};

// Helper to create a sub-heading
const createSubHeading = (text) => {
    return new Paragraph({
        text: text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
    });
};

// Helper to create a professional paragraph
const createParagraph = (text, options = {}) => {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                size: 24, // 12pt
                ...options
            }),
        ],
        spacing: { line: 360, after: 200 }, // 1.5 line spacing
        alignment: AlignmentType.JUSTIFY
    });
};

// Helper to create a list item
const createListItem = (text) => {
    return new Paragraph({
        text: text,
        bullet: { level: 0 },
        spacing: { after: 120 },
        indent: { left: 720, hanging: 360 }
    });
};

const doc = new Document({
    sections: [
        {
            properties: {},
            children: [
                // TITLE PAGE
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "DoctorsNode",
                            bold: true,
                            size: 72,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 2000, after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "The Comprehensive Doctor's Assistant & Patient Care Platform",
                            size: 32,
                            italic: true,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 3000 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Product Documentation & Feature Guide",
                            size: 28,
                            bold: true,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Version: 1.0.0`,
                            size: 24,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Date: ${new Date().toLocaleDateString()}`,
                            size: 24,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ children: [new PageBreak()] }),

                // TABLE OF CONTENTS (Placeholder text for 15 pages)
                createHeading("Table of Contents"),
                createParagraph("1. Executive Summary ......................................................................................... Page 3"),
                createParagraph("2. Introduction to DoctorsNode ............................................................................. Page 4"),
                createParagraph("3. Core Vision and Mission ..................................................................................... Page 5"),
                createParagraph("4. Feature Spotlight: Doctor Experience ................................................................ Page 6"),
                createParagraph("   4.1 The Intelligence Dashboard ............................................................................ Page 6"),
                createParagraph("   4.2 Advanced Statistics and Analytics ................................................................. Page 7"),
                createParagraph("5. Feature Spotlight: Patient Management ............................................................ Page 8"),
                createParagraph("   5.1 Creating and Managing Digital Profiles ....................................................... Page 8"),
                createParagraph("   5.2 Historical Data and Trends ............................................................................ Page 9"),
                createParagraph("6. Medicine Scheduling and Adherence ............................................................... Page 10"),
                createParagraph("   6.1 Frequency Logic and Dosage Control ........................................................... Page 10"),
                createParagraph("   6.2 Automated Reminder Windows .................................................................... Page 11"),
                createParagraph("7. Communication Engine: WhatsApp & Twilio .................................................... Page 12"),
                createParagraph("   7.1 Real-time Notifications ................................................................................. Page 12"),
                createParagraph("   7.2 Interactive Two-Way Responses .................................................................. Page 13"),
                createParagraph("8. Technical Specifications and Administration ..................................................... Page 14"),
                createParagraph("9. Troubleshooting and Support ............................................................................ Page 15"),
                createParagraph("10. Future Roadmap and Scalability ...................................................................... Page 16"),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 3: EXECUTIVE SUMMARY
                createHeading("1. Executive Summary"),
                createParagraph("The global healthcare landscape is rapidly evolving, with a growing emphasis on preventative care and chronic disease management. One of the most significant challenges in modern medicine is patient adherence—specifically, the consistency with which patients take their prescribed medications. Research indicates that nearly 50% of patients with chronic illnesses fail to follow their medication regimen as prescribed, leading to avoidable complications, increased hospitalizations, and billions of dollars in excess healthcare costs."),
                createParagraph("DoctorsNode was born out of the necessity to bridge this gap. Designed as a high-fidelity, doctor-centric application, DoctorsNode provides a seamless interface for medical professionals to manage their patient database while automating the critical task of medication monitoring. By leveraging the ubiquity of WhatsApp, the platform ensures that reminders are delivered through a channel that patients already use and trust daily."),
                createParagraph("This document provides an exhaustive overview of the DoctorsNode ecosystem, detailing its features, technical architecture, and the strategic value it brings to both clinical practices and patient outcomes. From its intuitive dashboard to its sophisticated backend automation, DoctorsNode represents the next step in digital health assistants."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 4: INTRODUCTION
                createHeading("2. Introduction to DoctorsNode"),
                createParagraph("DoctorsNode is more than just a scheduling tool; it is a full-featured clinical management assistant tailored for the modern practitioner. In a busy clinic, a doctor spends hours diagnosing and prescribing. However, once the patient leaves the clinic, the doctor's influence often wanes. DoctorsNode extends the doctor's care into the patient's home, acting as a digital proxy that monitors health schedules in real-time."),
                createSubHeading("2.1 Why DoctorsNode?"),
                createParagraph("Traditional methods of medication reminders—such as paper checklists or dedicated health apps—frequently fail because they require too much effort from the patient. Most dedicated apps are deleted within weeks, and paper lists are easily forgotten. DoctorsNode solves this by placing the reminder exactly where the patient is: in their WhatsApp inbox."),
                createSubHeading("2.2 Targeted Users"),
                createListItem("Individual Practitioners: Doctors running private clinics who want to improve patient retention and health outcomes."),
                createListItem("Multi-Specialty Clinics: Facilities managing hundreds of patients across different departments."),
                createListItem("Chronic Care Teams: Nurses and assistants who support doctors in managing long-term patient health."),
                createParagraph("By centralizing patient data and medicine schedules, DoctorsNode reduces administrative overhead, allowing healthcare providers to focus on what matters most: saving lives and improving quality of life."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 5: VISION AND MISSION
                createHeading("3. Core Vision and Mission"),
                createParagraph("Our vision is a world where medical non-adherence is a problem of the past. We believe that technology should serve humanity by removing the friction from essential daily tasks. For a diabetic patient or a cardiac patient, a missed pill is not just an inconvenience; it is a risk factor. DoctorsNode's mission is to eliminate that risk through persistent, intelligent automation."),
                createSubHeading("3.1 Empowering Doctors"),
                createParagraph("We aim to empower doctors with data. When a patient returns for a follow-up, the first question is usually 'Did you take your medicines regularly?'. Typically, the patient says 'Yes', but the data might say otherwise. DoctorsNode provides doctors with a 'Response History' that shows exactly when a patient confirmed taking a pill or requested a snooze. This enables 'Data-Driven Consultations'."),
                createSubHeading("3.2 Simplifying Patient Lives"),
                createParagraph("At the patient end, simplicity is key. There is no password to remember, no app to update. Every interaction happens via a simple WhatsApp message. This accessibility is particularly important for elderly patients who may not be tech-savvy but are comfortable with basic messaging apps."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 6: FEATURE SPOTLIGHT - THE DOCTOR DASHBOARD
                createHeading("4. Feature Spotlight: Doctor Experience"),
                createSubHeading("4.1 The Intelligence Dashboard"),
                createParagraph("The heartbeat of DoctorsNode is the Doctor Dashboard. Upon logging in via a secure JWT-based authentication system, the practitioner is greeted with a birds-eye view of their entire practice. The dashboard is designed with 'Information Density' in mind—showing everything necessary at a glance without overwhelming the user."),
                createListItem("Active Patients Count: Instantly see how many patients are currently under your care."),
                createListItem("Daily Reminders Sent: A counter showing the volume of activity the system has handled for you today."),
                createListItem("Adherence Rate: A calculated percentage showing how many patients are marking their medicines as 'Taken' vs 'Snoozed'."),
                createListItem("Urgent Notifications: Highlights patients who have missed multiple doses consecutively."),
                createParagraph("The layout is responsive, allowing doctors to check their practice status from a desktop in the clinic or a smartphone while on the move. Every element is interactive, allowing a deep dive into specific patient lists or reminder logs with a single click."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 7: STATISTICS AND ANALYTICS
                createSubHeading("4.2 Advanced Statistics and Analytics"),
                createParagraph("DoctorsNode goes beyond simple counts. It provides visual analytics that help doctors spot trends. For instance, a doctor might notice that a particular medication has a high 'Snooze' rate across multiple patients. This might indicate that the medication has side effects or is being prescribed at an inconvenient time of day."),
                createListItem("Temporal Trends: Analysis of medication adherence by time of day (Morning vs. Evening)."),
                createListItem("Disease-wise Analytics: Adherence rates categorized by disease types (e.g., Hypertension vs Diabetes)."),
                createListItem("Patient Engagement Logs: A minute-by-minute activity feed showing system checks and patient interactions."),
                createParagraph("These insights allow doctors to modify treatments proactively. If the analytics show that patients consistently snooze their 2 PM dose, the doctor might adjust the schedule to better fit a typical working person's lifestyle, thereby increasing the probability of success."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 8: FEATURE SPOTLIGHT - PATIENT MANAGEMENT
                createHeading("5. Feature Spotlight: Patient Management"),
                createSubHeading("5.1 Creating and Managing Digital Profiles"),
                createParagraph("Managing a diverse patient base requires a robust organization system. DoctorsNode's Patient Management module is built to be both powerful and user-friendly. Each patient is treated as a unique entity with a comprehensive digital file."),
                createListItem("Demographic Details: Name, Age, Gender, and WhatsApp-enabled mobile number."),
                createListItem("Clinical Metadata: Primary disease diagnosis and secondary health notes."),
                createListItem("Historical View: A log of all previous medicines prescribed and the patient's historical adherence levels."),
                createParagraph("The 'Add Patient' workflow is streamlined to take less than 30 seconds. A search bar with real-time filtering ensures that even in a database of thousands, finding a specific patient is instantaneous. Privacy is paramount; patient data is encrypted and accessible only by the authorized doctor."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 9: PATIENT DATA TRENDS
                createSubHeading("5.2 Historical Data and Trends"),
                createParagraph("One of the most powerful features of the Patient Management module is the ability to view 'Longitudinal Health Data'. Doctors can see how a patient's adherence has changed over months or years. This is particularly useful in managing chronic conditions where long-term consistency is the primary predictor of health."),
                createListItem("Adherence Heatmaps: Visual grids showing 'Taken' vs 'Missed' days over the last month."),
                createListItem("Disease Progression Notes: A centralized place for doctors to add notes during each visit, creating a comprehensive medical history."),
                createListItem("Automated Profile Cards: Summarized versions of patient details that can be printed or shared with colleagues for consultation."),
                createParagraph("By having this information at their fingertips, doctors can have more meaningful and persuasive conversations with their patients about the importance of their treatment plans."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 10: MEDICINE SCHEDULING
                createHeading("6. Medicine Scheduling and Adherence"),
                createSubHeading("6.1 Frequency Logic and Dosage Control"),
                createParagraph("The core engine of DoctorsNode is its sophisticated scheduling algorithm. Prescribing a medicine is not just about naming the drug; it's about defining a precise rhythm. DoctorsNode supports complex scheduling patterns to match any prescription."),
                createListItem("Daily Frequencies: Support for multiple doses per day (e.g., TDS - Three times a day, BD - Twice a day)."),
                createListItem("Custom Intervals: Specific hours between doses (e.g., every 8 hours)."),
                createListItem("SOS / PRN Support: Medicines that are only taken 'as needed' but still require a tracking mechanism."),
                createListItem("Dosage Specification: Precise units (mg, ml, tabs) and instructions (Before Food, After Food)."),
                createParagraph("The system prevents scheduling conflicts and ensures that the total daily dosage remains within safe limits. Once a medicine is added, the 'MedicineSchedules' table is automatically populated with the next set of reminders, ensuring the automation never skips a beat."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 11: AUTOMATED REMINDER WINDOWS
                createSubHeading("6.2 Automated Reminder Windows"),
                createParagraph("DoctorsNode doesn't just send a message and walk away. It operates on a 'Check-and-Verify' logic. Every minute, a background system (Node-Cron) scans the database for scheduled medicines that are due for a reminder."),
                createListItem("The Zero-Wait Trigger: As soon as the clock hits the scheduled minute, the Twilio API is invoked."),
                createListItem("The Reminder Window: If a patient doesn't respond, the system can be configured to send a secondary 'Nudge' after a certain interval."),
                createListItem("Automated Status Transitions: Medicines move from 'Pending' to 'Sent' to 'Taken/Late' automatically based on real-time feedback."),
                createParagraph("This high-frequency checking mechanism guarantees that patients receive their notifications with professional precision, maintaining the 'Urgency and Importance' of the medical advice."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 12: COMMUNICATION ENGINE
                createHeading("7. Communication Engine: WhatsApp & Twilio"),
                createSubHeading("7.1 Real-time Notifications"),
                createParagraph("The integration with Twilio's WhatsApp API is the backbone of DoctorsNode's communication strategy. WhatsApp has over 2 billion active users and an open rate of over 90%, making it the most effective channel for healthcare reminders. Our implementation uses secure Webhooks to handle the flow of data back and forth."),
                createListItem("Rich Text Messages: Reminders include the medicine name, dosage, and specific instructions in a clear, easy-to-read format."),
                createListItem("Status Tracking: Doctors can see 'Read Receipts' for the reminders, knowing exactly when a patient saw the message."),
                createListItem("Global Reach: Support for international phone formats, allowing doctors to serve patients regardless of their location."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 13: INTERACTIVE TWO-WAY RESPONSES
                createSubHeading("7.2 Interactive Two-Way Responses"),
                createParagraph("DoctorsNode is not a one-way broadcasting system; it is a conversation-based tool. Patients can reply to reminders to update the system. This 'Closed-Loop' communication is what sets DoctorsNode apart from simple alarm apps."),
                createListItem("'Taken' Confirmation: When a patient replies 'taken', the schedule status is immediately updated in the doctor's database."),
                createListItem("'Snooze' Functionality: Patients can reply 'snooze 10' to be reminded again in 10 minutes. The system intelligently reschedules the specific dose without affecting future doses."),
                createListItem("'Help' Command: Patients can request information about their current medication list by sending a simple keyword."),
                createParagraph("This interaction model feels natural to patients and provides the doctor with high-fidelity compliance data without any manual effort from the clinic staff."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 14: TECHNICAL SPECIFICATIONS
                createHeading("8. Technical Specifications and Administration"),
                createSubHeading("8.1 The Tech Stack"),
                createParagraph("DoctorsNode is built on a modern, high-performance stack designed for reliability and speed."),
                createListItem("Frontend: Next.js 14 with React 18, providing a fast, SEO-friendly, and responsive user interface."),
                createListItem("Backend: Next.js API Routes (Serverless ready), ensuring scalable logic and secure data processing."),
                createListItem("Database: Prisma ORM with SQLite (for development) and PostgreSQL compatibility (for production deployment)."),
                createListItem("Authentication: NextAuth.js with JWT and Bcrypt password hashing."),
                createSubHeading("8.2 Security and Privacy"),
                createParagraph("Given the sensitivity of medical data, DoctorsNode adheres to strict security standards. All API routes are protected by session tokens, and cross-origin requests are strictly controlled. Database migrations are managed via Prisma, ensuring a consistent and versioned schema."),
                new Paragraph({ children: [new PageBreak()] }),

                // PAGE 15: TROUBLESHOOTING AND SUPPORT
                createHeading("9. Troubleshooting and Support"),
                createParagraph("While DoctorsNode is designed for 99.9% uptime, we provide comprehensive troubleshooting resources for clinic administrators."),
                createSubHeading("Common Issues and Solutions"),
                createListItem("Notifications not sending: Verify that the Twilio Sandbox has been 'Joined' by the patient and the phone number includes the '+' country code."),
                createListItem("Login failures: Ensure the NEXTAUTH_SECRET environment variable is correctly set in the production environment."),
                createListItem("Database errors: Ensure migrations are up to date using the 'npx prisma migrate' command suite."),
                createParagraph("For advanced support, the system includes a 'Health Check' API that verifies connectivity with Twilio and the database status in real-time. This allows for rapid identification and resolution of any infrastructure issues."),
                createHeading("10. Future Roadmap and Conclusion"),
                createParagraph("DoctorsNode is constantly evolving. Our roadmap includes AI-powered adherence predictions, a dedicated patient portal for viewing historical lab results, and integration with pharmacy delivery services. In conclusion, DoctorsNode is more than a software product; it is a commitment to better health through better communication. We are proud to support healthcare heroes in their mission to provide excellent care."),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "--- END OF DOCUMENT ---",
                            italic: true,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 1000 },
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("DoctorsNode_Documentation.docx", buffer);
    console.log("Document created successfully: DoctorsNode_Documentation.docx");
}).catch(err => {
    console.error("Error creating document:", err);
    process.exit(1);
});

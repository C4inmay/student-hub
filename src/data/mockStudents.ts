export interface Student {
  id: string;
  name: string;
  uid: string;
  email: string;
  year: number;
  branch: string;
  major: string;
  cgpa: number;
  skills: string[];
  profilePicture?: string;
  academicRank?: number;
  sportsRank?: number;
  hackathonRank?: number;
  internshipRank?: number;
  overallRank?: number;
  certificates: Array<{ name: string; issuer: string; date: string }>;
  internships: Array<{ company: string; role: string; duration: string }>;
  hackathons: Array<{ name: string; position: string; date: string }>;
  sports: Array<{ sport: string; achievement: string; year: string }>;
  extracurricular: Array<{ activity: string; role: string; year: string }>;
}

export const mockStudents: Student[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    uid: "STU2021001",
    email: "rahul.sharma@university.edu",
    year: 3,
    branch: "Computer Science",
    major: "Software Engineering",
    cgpa: 9.2,
    skills: ["Python", "React", "Machine Learning", "Data Structures"],
    academicRank: 1,
    sportsRank: 15,
    hackathonRank: 3,
    internshipRank: 2,
    overallRank: 1,
    certificates: [
      { name: "AWS Solutions Architect", issuer: "Amazon", date: "2023-08" },
      { name: "Google Cloud Professional", issuer: "Google", date: "2023-06" }
    ],
    internships: [
      { company: "Microsoft", role: "SDE Intern", duration: "Summer 2023" },
      { company: "Google", role: "ML Intern", duration: "Winter 2022" }
    ],
    hackathons: [
      { name: "Smart India Hackathon", position: "Winner", date: "2023-09" },
      { name: "HackMIT", position: "Finalist", date: "2023-03" }
    ],
    sports: [
      { sport: "Cricket", achievement: "University Team Captain", year: "2023" }
    ],
    extracurricular: [
      { activity: "Coding Club", role: "President", year: "2023" },
      { activity: "Tech Fest", role: "Organizer", year: "2022-2023" }
    ]
  },
  {
    id: "2",
    name: "Priya Patel",
    uid: "STU2021002",
    email: "priya.patel@university.edu",
    year: 3,
    branch: "Computer Science",
    major: "AI & Data Science",
    cgpa: 9.5,
    skills: ["TensorFlow", "PyTorch", "NLP", "Computer Vision"],
    academicRank: 2,
    sportsRank: 8,
    hackathonRank: 1,
    internshipRank: 1,
    overallRank: 2,
    certificates: [
      { name: "Deep Learning Specialization", issuer: "Coursera", date: "2023-07" },
      { name: "TensorFlow Developer", issuer: "Google", date: "2023-05" }
    ],
    internships: [
      { company: "Meta", role: "AI Research Intern", duration: "Summer 2023" },
      { company: "Amazon", role: "ML Intern", duration: "Winter 2022" }
    ],
    hackathons: [
      { name: "AI Hackathon MIT", position: "Winner", date: "2023-10" },
      { name: "Google AI Challenge", position: "Winner", date: "2023-06" }
    ],
    sports: [
      { sport: "Badminton", achievement: "State Level Player", year: "2023" }
    ],
    extracurricular: [
      { activity: "AI Research Lab", role: "Lead Researcher", year: "2023" },
      { activity: "Women in Tech", role: "Mentor", year: "2022-2023" }
    ]
  },
  {
    id: "3",
    name: "Arjun Kumar",
    uid: "STU2021003",
    email: "arjun.kumar@university.edu",
    year: 2,
    branch: "Electronics",
    major: "IoT Systems",
    cgpa: 8.8,
    skills: ["Arduino", "Raspberry Pi", "C++", "IoT Protocols"],
    academicRank: 5,
    sportsRank: 3,
    hackathonRank: 7,
    internshipRank: 8,
    overallRank: 5,
    certificates: [
      { name: "IoT Specialist", issuer: "Cisco", date: "2023-04" }
    ],
    internships: [
      { company: "Bosch", role: "IoT Intern", duration: "Summer 2023" }
    ],
    hackathons: [
      { name: "IoT Hackathon", position: "Runner-up", date: "2023-07" }
    ],
    sports: [
      { sport: "Football", achievement: "University Team", year: "2023" },
      { sport: "Athletics", achievement: "100m Sprint Gold", year: "2023" }
    ],
    extracurricular: [
      { activity: "Robotics Club", role: "Member", year: "2022-2023" }
    ]
  },
  {
    id: "4",
    name: "Sneha Reddy",
    uid: "STU2021004",
    email: "sneha.reddy@university.edu",
    year: 4,
    branch: "Computer Science",
    major: "Cybersecurity",
    cgpa: 9.0,
    skills: ["Network Security", "Penetration Testing", "Cryptography", "Ethical Hacking"],
    academicRank: 3,
    sportsRank: 20,
    hackathonRank: 5,
    internshipRank: 4,
    overallRank: 3,
    certificates: [
      { name: "CEH - Certified Ethical Hacker", issuer: "EC-Council", date: "2023-09" },
      { name: "CISSP", issuer: "ISC2", date: "2023-03" }
    ],
    internships: [
      { company: "IBM Security", role: "Security Analyst Intern", duration: "Summer 2023" },
      { company: "Palo Alto Networks", role: "Cybersecurity Intern", duration: "Winter 2022" }
    ],
    hackathons: [
      { name: "CyberSec CTF", position: "Top 10", date: "2023-08" }
    ],
    sports: [],
    extracurricular: [
      { activity: "Cybersecurity Club", role: "Vice President", year: "2023" }
    ]
  },
  {
    id: "5",
    name: "Vikram Singh",
    uid: "STU2021005",
    email: "vikram.singh@university.edu",
    year: 3,
    branch: "Mechanical",
    major: "Automotive Design",
    cgpa: 8.5,
    skills: ["CAD", "AutoCAD", "SolidWorks", "Finite Element Analysis"],
    academicRank: 8,
    sportsRank: 1,
    hackathonRank: 12,
    internshipRank: 6,
    overallRank: 6,
    certificates: [
      { name: "AutoCAD Professional", issuer: "Autodesk", date: "2023-05" }
    ],
    internships: [
      { company: "Tata Motors", role: "Design Intern", duration: "Summer 2023" }
    ],
    hackathons: [],
    sports: [
      { sport: "Basketball", achievement: "National Level Captain", year: "2023" },
      { sport: "Volleyball", achievement: "State Champion", year: "2022" }
    ],
    extracurricular: [
      { activity: "Sports Committee", role: "Secretary", year: "2023" }
    ]
  },
  {
    id: "6",
    name: "Ananya Iyer",
    uid: "STU2021006",
    email: "ananya.iyer@university.edu",
    year: 2,
    branch: "Computer Science",
    major: "Web Development",
    cgpa: 8.9,
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "GraphQL"],
    academicRank: 4,
    sportsRank: 12,
    hackathonRank: 2,
    internshipRank: 3,
    overallRank: 4,
    certificates: [
      { name: "Full Stack Developer", issuer: "Meta", date: "2023-06" }
    ],
    internships: [
      { company: "Stripe", role: "Frontend Intern", duration: "Summer 2023" }
    ],
    hackathons: [
      { name: "React Conf Hackathon", position: "Winner", date: "2023-09" },
      { name: "Web3 Hackathon", position: "Finalist", date: "2023-04" }
    ],
    sports: [
      { sport: "Chess", achievement: "University Champion", year: "2023" }
    ],
    extracurricular: [
      { activity: "Web Dev Club", role: "Lead", year: "2023" }
    ]
  }
];

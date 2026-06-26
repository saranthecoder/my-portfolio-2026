const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { Admin, Profile, Stat, Experience, Education, Skill, Project } = require('./models');

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://saranthecodder:saransaran@cluster0.hz2ibvp.mongodb.net/saranv';

async function seed() {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB!');

    // Clear existing data (optional but good for a clean start)
    await Admin.deleteMany({});
    await Profile.deleteMany({});
    await Stat.deleteMany({});
    await Experience.deleteMany({});
    await Education.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});

    console.log('Cleared existing collection data.');

    // 1. Create Default Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new Admin({
      username: 'admin',
      password: hashedPassword
    });
    await adminUser.save();
    console.log('Default admin account created: admin / admin123');

    // 2. Create Profile Data
    const profile = new Profile({
      name: "Saran Velmurugan",
      title: "Building Scalable Apps.",
      subtitle: "I am Saran Velmurugan, a Full Stack Developer & Technical Trainer. Specialized in architecting high-performance MERN, Java, Python, and GenAI applications while having trained 2,500+ engineers globally.",
      statusBadge: "Available for Full-Time & Freelance Roles",
      email: "saranbtech2021@gmail.com",
      phone: "+91 93802 24658",
      location: "Whitefield, Bengaluru, India",
      linkedin: "https://www.linkedin.com/in/saran-velmurugan-357499238/",
      github: "https://github.com/saranthecoder",
      resumeUrl: "#",
      profilePicture: "profile.jpg",
      aboutLeadText: "Full Stack Developer and Technical Trainer with 4+ years of hands-on experience building production-ready web applications and training 2,500+ developers across leading engineering institutions.",
      aboutText: "Proficient in architecting and deploying scalable MERN stack applications with emphasis on clean code, system design, and maintainable architecture. Delivered structured training across 8+ engineering institutions in 4 states, impacting 500+ students. Author of 18+ shipped projects spanning UI-only frontends to end-to-end full stack platforms. Proven expertise in translating complex technical concepts into engaging, project-driven learning experiences. Open to full-time, freelance, and remote roles in development or technical training.",
      fellowships: [
        "edX Verified Certificate for Introduction to the Internet of Things",
        "Full Stack Web Development Fellowship (MERN, system design, collaboration)",
        "Smart India Hackathon (SIH 2023) Participant",
        "GenAI + Full Stack Curriculum Pioneer (First to deliver LLM syllabus at FISAT Kochi, 2026)",
        "\"Technical Excellence in Training\" Recognition – MIT Mysuru, Karnataka",
        "\"Industry Mentor Appreciation\" Recognition – TCE Gadag, Karnataka",
        "\"Startup Ecosystem Supporter\" Recognition – Kochi, Kerala",
        "Guest Speaker & Technical Trainer (workshops on Full Stack, GenAI, and Startup Building)"
      ]
    });
    await profile.save();
    console.log('Seeded profile settings.');

    // 3. Create Stats
    const statsData = [
      { target: 4, label: 'Freelancing Experience' },
      { target: 2500, label: 'Developers Trained' },
      { target: 20, label: 'Production Apps Shipped' },
      { target: 94, label: 'Interview Offer Rate' }
    ];
    await Stat.insertMany(statsData);
    console.log('Seeded stats section counters.');

    // 4. Create Experiences
    const experiencesData = [
      // Engineering Roles
      {
        role: "Full Stack Developer & Trainer",
        company: "Arikya (a product of Heedsites)",
        location: "Bengaluru, Karnataka",
        dateRange: "Oct 2025 – May 2026",
        points: [
          "Developed production-grade web applications with React frontend and Node.js backend, responsive UI, state management, and seamless API integration.",
          "Built multi-tenant dashboard module reducing client onboarding time by 40%; implemented JWT + refresh-token auth and RBAC across the stack.",
          "Conducted full stack training covering modern JavaScript, React, Express, MongoDB, and end-to-end deployment workflows."
        ],
        type: "engineering"
      },
      {
        role: "Chief Examination Technology Officer (CETO)",
        company: "WebNexZ Foundation",
        location: "Bengaluru, Karnataka",
        dateRange: "Nov 2024 – Present",
        points: [
          "Responsible for designing, building, and governing the end-to-end digital examination ecosystem.",
          "Oversees AI-integrated exam platforms, entrance test workflows, proctoring systems, and technology-driven selection processes to ensure fairness, security, scalability, and integrity in examinations.",
          "Built scalable architecture with secure authentication, exam session management, automated grading algorithms, and analytics dashboard."
        ],
        type: "engineering",
        highlight: {
          title: "Smart Proctoring System",
          desc: "React (admin portal) + Node.js + MongoDB + WebRTC. Flagged 98.4% of malpractice incidents in pilot batch; deployed across 3 state-level entrance exams."
        }
      },
      {
        role: "Founder & CEO / Full Stack Developer",
        company: "Saredufy Web Plus Academy Pvt. Ltd.",
        location: "Tirupati, Andhra Pradesh",
        dateRange: "May 2024 – Present",
        points: [
          "Founder & CEO of Saredufy Web Plus Academy, directing business strategy, developer mentoring programs, and academic alignment.",
          "Led Saredufy Launchpad, a selective, merit-driven initiative focused on developing startup-ready developers through practical training and disciplined workflows.",
          "Developed and deployed multiple MERN stack applications focusing on scalability and clean architecture."
        ],
        type: "engineering"
      },
      {
        role: "Chief Technology Officer",
        company: "Harebin Tech Solutions Pvt. Ltd.",
        location: "Andhra Pradesh",
        dateRange: "Jun 2024 – Nov 2024",
        points: [
          "Delivered 3 client MERN applications on schedule; set up Git/CI-CD workflows; reduced bug-to-production rate by 35%.",
          "Managed 5-member engineering team with daily stand-ups and bi-weekly sprint reviews."
        ],
        type: "engineering"
      },
      {
        role: "Chief Product Officer (CPO)",
        company: "Pick and Partner",
        location: "Bengaluru, Karnataka",
        dateRange: "Nov 2023 – Apr 2024",
        points: [
          "Governed product lifecycle management, aligning backend APIs, database design, and user workflows.",
          "Bridged product strategy, design, and engineering pipelines to deliver scalable web solutions."
        ],
        type: "engineering"
      },
      // Training Roles
      {
        role: "Technical Trainer — Java, Python & GenAI Full Stack",
        company: "Ethnotech Academy",
        location: "Bengaluru, Karnataka",
        dateRange: "Jan 2026 – Present",
        points: [
          "Java Full Stack Trainer for CS & BS students at MIT Mysuru — core Java, OOP, Spring Boot, and web technologies.",
          "Java Full Stack Trainer for CSE & CSD students at TCE Gadag — hands-on project-based curriculum and live coding.",
          "Python Full Stack Trainer for ECE students at TCE Gadag — Python, Django/Flask, REST APIs, and frontend integration.",
          "Pioneered GenAI + Full Stack curriculum at FISAT Kochi — LLM APIs, prompt engineering, and AI-powered UI into MERN syllabus.",
          "Designed 12 lab modules covering Spring Boot microservices, JWT auth, React trees, and production deployment — adopted institution-wide."
        ],
        type: "training",
        highlight: {
          title: "AI Study Companion (FISAT Kochi)",
          desc: "GenAI-powered study assistant using OpenAI API + React + Node.js. Won internal college hackathon; 40 students built their own startup ideas and implementing in real-world."
        }
      },
      {
        role: "Technical Mentor — Full Stack Development",
        company: "HyperVerge Academy",
        location: "Bengaluru, Karnataka",
        dateRange: "Jul 2025 – Jan 2026",
        points: [
          "Mentored 60+ developers through 1:1 sessions, code reviews, and personalised guidance on full stack skills and career growth.",
          "Guided mentees through real-world project builds covering system design, development, debugging, and deployment — 78% landed roles within 3 months of completion."
        ],
        type: "training"
      },
      {
        role: "Technical Trainer — Full Stack (Freelance)",
        company: "HCL GUVI · SVCET",
        location: "Chittoor, Andhra Pradesh",
        dateRange: "Sep 2025 – Nov 2025",
        points: [
          "Delivered intensive full stack bootcamp to 60+ engineering students — HTML5, CSS3, JavaScript, React.js, Node.js, Express, and MongoDB.",
          "Designed coding exercises, live demonstrations, and practical projects with technical assessments and interview preparation support; 82% achieved distinction."
        ],
        type: "training"
      },
      {
        role: "Full Stack Development Trainer",
        company: "WebPlus Academy",
        location: "Madanapalle, Andhra Pradesh",
        dateRange: "Jan 2022 – Nov 2024",
        points: [
          "Trained 1,200+ students in MERN stack development over 3 years — comprehensive curriculum, live coding, and hands-on project mentorship.",
          "Developed extensive course materials and implemented Git version control training; maintained consistently high student satisfaction scores.",
          "Conducted mock interviews and debugging workshops — achieved 85%+ placement rate."
        ],
        type: "training"
      }
    ];
    await Experience.insertMany(experiencesData);
    console.log('Seeded experience cards.');

    // 5. Seed Education
    const educationData = [
      { school: "Madanapalle Institute of Technology & Science (MITS)", degree: "Bachelor of Technology - B.Tech, Computer Science", dateRange: "Dec 2021 – May 2025" },
      { school: "Narayana Junior College", degree: "Inter, Intermediate", dateRange: "Aug 2018 – May 2020" },
      { school: "Sri Venkateswara Children's High School", degree: "SSC, School", dateRange: "Aug 2008 – Apr 2018" }
    ];
    await Education.insertMany(educationData);
    console.log('Seeded education details.');

    // 6. Seed Skills
    const skillsData = [
      { category: 'Languages', name: 'JavaScript (ES6+)' },
      { category: 'Languages', name: 'Python' },
      { category: 'Languages', name: 'HTML5 & CSS3' },
      { category: 'Languages', name: 'SQL' },
      
      { category: 'Frontend', name: 'React.js' },
      { category: 'Frontend', name: 'Redux' },
      { category: 'Frontend', name: 'Tailwind CSS' },
      { category: 'Frontend', name: 'Responsive Design' },
      { category: 'Frontend', name: 'Flexbox & CSS Grid' },
      { category: 'Frontend', name: 'DOM APIs' },
      { category: 'Frontend', name: 'Component Architecture' },

      { category: 'Backend', name: 'Node.js' },
      { category: 'Backend', name: 'Express.js' },
      { category: 'Backend', name: 'RESTful API Design' },
      { category: 'Backend', name: 'JWT Authentication' },
      { category: 'Backend', name: 'OAuth' },
      { category: 'Backend', name: 'NodeMailer' },
      { category: 'Backend', name: 'Middleware Architecture' },

      { category: 'Databases', name: 'MongoDB (Aggregation, Indexing)' },
      { category: 'Databases', name: 'MySQL (Joins, Stored Procedures)' },
      { category: 'Databases', name: 'Schema Modeling' },
      
      { category: 'Java Full Stack', name: 'Java (Core & Advanced)' },
      { category: 'Java Full Stack', name: 'Spring Boot' },
      { category: 'Java Full Stack', name: 'Spring MVC' },
      { category: 'Java Full Stack', name: 'Spring Data JPA' },
      { category: 'Java Full Stack', name: 'Hibernate ORM' },
      { category: 'Java Full Stack', name: 'Spring Security' },
      { category: 'Java Full Stack', name: 'Microservices' },
      { category: 'Java Full Stack', name: 'JUnit / Mockito' },
      { category: 'Java Full Stack', name: 'Maven & Gradle' },
      
      { category: 'Python Full Stack', name: 'Python (OOPs)' },
      { category: 'Python Full Stack', name: 'Django Framework' },
      { category: 'Python Full Stack', name: 'Flask / FastAPI' },
      { category: 'Python Full Stack', name: 'SQLAlchemy / ORM' },
      { category: 'Python Full Stack', name: 'Celery (Async Tasks)' },
      { category: 'Python Full Stack', name: 'Jinja2 Templates' },
      { category: 'Python Full Stack', name: 'REST APIs (DRF)' },
      { category: 'Python Full Stack', name: 'PyTest' },
      
      { category: 'MERN + GenAI', name: 'MERN Stack Integration' },
      { category: 'MERN + GenAI', name: 'LLM Orchestration' },
      { category: 'MERN + GenAI', name: 'LangChain / LlamaIndex' },
      { category: 'MERN + GenAI', name: 'Retrieval-Augmented Gen (RAG)' },
      { category: 'MERN + GenAI', name: 'Vector DBs (Chroma/Pinecone)' },
      { category: 'MERN + GenAI', name: 'OpenAI & Gemini APIs' },
      { category: 'MERN + GenAI', name: 'AI Agent Workflows' },
      { category: 'MERN + GenAI', name: 'Prompt Engineering' },

      { category: 'DevOps & Tools', name: 'Git & GitHub' },
      { category: 'DevOps & Tools', name: 'Postman' },
      { category: 'DevOps & Tools', name: 'npm' },
      { category: 'DevOps & Tools', name: 'VS Code' },
      { category: 'DevOps & Tools', name: 'Chrome DevTools' },
      { category: 'DevOps & Tools', name: 'CI/CD Concepts' },
      { category: 'DevOps & Tools', name: 'Deployment Pipelines' },

      { category: 'UI/UX & Design', name: 'Figma Prototyping' },
      { category: 'UI/UX & Design', name: 'Wireframing' },
      { category: 'UI/UX & Design', name: 'Accessibility (WCAG)' },
      { category: 'UI/UX & Design', name: 'Performance Optimisation' },

      { category: 'Engineering', name: 'System Design' },
      { category: 'Engineering', name: 'Clean Architecture' },
      { category: 'Engineering', name: 'Code Reviews' },
      { category: 'Engineering', name: 'Unit Testing' },
      { category: 'Engineering', name: 'Agile Methodologies' },

      { category: 'Training & Education', name: 'Curriculum Design' },
      { category: 'Training & Education', name: 'Live Coding' },
      { category: 'Training & Education', name: 'Assessment Design' },
      { category: 'Training & Education', name: 'Career Guidance' },
      { category: 'Training & Education', name: 'Technical Mentoring' },
      { category: 'Training & Education', name: 'LMS Platforms' }
    ];
    await Skill.insertMany(skillsData);
    console.log('Seeded skills categories.');

    // 7. Seed Projects
    const projectsData = [
      {
        title: "Smart Proctoring System",
        description: "Developed for WebNexZ. Flags 98.4% of malpractice incidents in pilot batches. Deployed across 3 state-level entrance exams.",
        category: "featured",
        tags: ["React", "Node.js", "MongoDB", "WebRTC"],
        imageUrl: ""
      },
      {
        title: "MELE — Exam Seating Order Arrangement",
        description: "Designed and built full stack application to automate complex exam seating arrangements, ensuring 100% data accuracy and compliance.",
        category: "featured",
        tags: ["MERN Stack", "Algorithms", "Security"],
        imageUrl: ""
      },
      {
        title: "AI Study Companion",
        description: "GenAI-powered study assistant using LLM APIs. Won internal college hackathon at FISAT Kochi; helped 40+ students build startups.",
        category: "featured",
        tags: ["React", "Node.js", "OpenAI API"],
        imageUrl: ""
      },
      {
        title: "Water & Electric Tracker",
        description: "Utility consumption tracking system with interactive dashboards built for Smart India Hackathon (SIH 2023).",
        category: "featured",
        tags: ["Node.js", "React", "Data Visualisation"],
        imageUrl: ""
      },
      {
        title: "MITS Entrance Exam Application",
        description: "Comprehensive portal for entrance exam registration, automated candidate notifications, and real-time result tracking.",
        category: "fullstack",
        tags: ["MERN Stack", "Auth", "NodeMailer"],
        imageUrl: ""
      },
      {
        title: "AutoSeat Exam Arrangement",
        description: "Automated seating allocation system assigning students to exam halls based on predefined layout rules.",
        category: "fullstack",
        tags: ["MERN Stack", "GenAI", "Auth Service"],
        imageUrl: ""
      },
      {
        title: "MailFlow Email Automation",
        description: "Bulk, scheduled, and event-triggered email delivery platform with detailed analytics and open tracking.",
        category: "fullstack",
        tags: ["MERN Stack", "NodeMailer", "GenAI"],
        imageUrl: ""
      },
      {
        title: "EduFlow LMS",
        description: "Course delivery, student enrolments, tracking dashboard, and progress assessment Management System.",
        category: "fullstack",
        tags: ["ReactJS", "ExpressJS", "MongoDB"],
        imageUrl: ""
      },
      {
        title: "CampusCore Student Mgmt",
        description: "Student enrolment portal, profile management, batch tracking, and administrative backend workflows.",
        category: "fullstack",
        tags: ["ReactJS", "ExpressJS", "MongoDB"],
        imageUrl: ""
      },
      {
        title: "AssignPro Task Platform",
        description: "Assignment creation interface, submission tracking pipelines, and student evaluation dashboards.",
        category: "fullstack",
        tags: ["ReactJS", "ExpressJS", "MongoDB"],
        imageUrl: ""
      },
      {
        title: "SecureAuth IAM System",
        description: "Enterprise-grade authentication, authorization, token refreshes, and Role-Based Access Control implementation.",
        category: "fullstack",
        tags: ["React", "Express", "MongoDB", "JWT"],
        imageUrl: ""
      },
      {
        title: "ExamSphere Exam Portal",
        description: "Online examinations platform featuring automated results compilation and detailed student analytics reports.",
        category: "fullstack",
        tags: ["ReactJS", "ExpressJS", "MongoDB"],
        imageUrl: ""
      },
      {
        title: "PeopleTrack HR Suite",
        description: "Employee lifecycle management system tracking departments, roles, employee records, and payroll schemas.",
        category: "fullstack",
        tags: ["React", "Node.js", "Express", "MySQL"],
        imageUrl: ""
      },
      {
        title: "ShopNest E-Commerce",
        description: "A complete shopping platform with cart handling, payment mocks, and comprehensive seller admin dashboards.",
        category: "fullstack",
        tags: ["ReactJS", "ExpressJS", "MongoDB"],
        imageUrl: ""
      },
      {
        title: "CertiGen Certificate Sys",
        description: "Automated, secure certificate generation with custom unique verification IDs and PDF downloadable formats.",
        category: "fullstack",
        tags: ["ReactJS", "ExpressJS", "MongoDB"],
        imageUrl: ""
      },
      {
        title: "Campfire Restaurant",
        description: "High-fidelity responsive restaurant website emphasizing modern CSS transitions, animations, and accessibility.",
        category: "frontend",
        tags: ["HTML5", "CSS3", "JavaScript"],
        imageUrl: ""
      },
      {
        title: "SVRM College Campus",
        description: "Academic portal website highlighting campus course catalogs, admissions procedures, and inquiry management forms.",
        category: "frontend",
        tags: ["HTML5", "CSS3", "JavaScript"],
        imageUrl: ""
      },
      {
        title: "Iyengar Bakery Landing",
        description: "High-conversion landing pages focused on local marketing campaigns and digital lead generation.",
        category: "frontend",
        tags: ["React.js", "Tailwind CSS"],
        imageUrl: ""
      }
    ];
    await Project.insertMany(projectsData);
    console.log('Seeded project items.');

    console.log('Database seeding successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();

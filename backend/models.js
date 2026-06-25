const mongoose = require('mongoose');

// Admin Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Profile / About Settings Schema
const ProfileSchema = new mongoose.Schema({
  name: { type: String, default: "Saran Velmurugan" },
  title: { type: String, default: "Building Scalable Apps." },
  subtitle: { type: String, default: "I am Saran Velmurugan, a Full Stack Developer & Technical Trainer. Specialized in architecting high-performance MERN, Java, Python, and GenAI applications while having trained 2,500+ engineers globally." },
  statusBadge: { type: String, default: "Available for Full-Time & Freelance Roles" },
  email: { type: String, default: "saranbtech2021@gmail.com" },
  phone: { type: String, default: "+91 93802 24658" },
  location: { type: String, default: "Whitefield, Bengaluru, India" },
  linkedin: { type: String, default: "https://www.linkedin.com/in/saran-velmurugan-357499238/" },
  github: { type: String, default: "https://github.com/saranthecoder" },
  leetcodeUsername: { type: String, default: "saranthecoder" },
  leetcodeUrl: { type: String, default: "https://leetcode.com/u/saranthecoder/" },
  resumeUrl: { type: String, default: "#" },
  profilePicture: { type: String, default: "profile.jpg" },
  aboutLeadText: { type: String, default: "Full Stack Developer and Technical Trainer with 4+ years of hands-on experience building production-ready web applications and training 2,500+ developers across leading engineering institutions." },
  aboutText: { type: String, default: "Proficient in architecting and deploying scalable MERN stack applications with emphasis on clean code, system design, and maintainable architecture. Delivered structured training across 8+ engineering institutions in 4 states, impacting 500+ students. Author of 18+ shipped projects spanning UI-only frontends to end-to-end full stack platforms. Proven expertise in translating complex technical concepts into engaging, project-driven learning experiences. Open to full-time, freelance, and remote roles in development or technical training." },
  fellowships: { type: [String], default: [] }
});

// Stats Schema
const StatSchema = new mongoose.Schema({
  target: { type: Number, required: true },
  label: { type: String, required: true }
});

// Experience Schema
const ExperienceSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  dateRange: { type: String, required: true },
  points: { type: [String], default: [] },
  type: { type: String, enum: ['engineering', 'training'], default: 'engineering' },
  highlight: {
    title: { type: String },
    desc: { type: String }
  }
});

// Education Schema
const EducationSchema = new mongoose.Schema({
  dateRange: { type: String, required: true },
  degree: { type: String, required: true },
  school: { type: String, required: true }
});

// Skill Schema
const SkillSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., 'Languages', 'Frontend', 'Backend', etc.
  name: { type: String, required: true }
});

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // 'fullstack', 'frontend', etc.
  tags: { type: [String], default: [] },
  imageUrl: { type: String },
  githubUrl: { type: String },
  liveUrl: { type: String }
});

// Comment Sub-schema
const CommentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  text: { type: String, required: true },
  dateReplied: { type: Date, default: Date.now }
});

// Activity Schema (LinkedIn-style posts)
const ActivitySchema = new mongoose.Schema({
  description: { type: String, required: true },
  images: { type: [String], default: [] }, // Array of uploaded image paths/URLs
  datePosted: { type: Date, default: Date.now },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  comments: { type: [CommentSchema], default: [] }
});

// Message Schema (Contact Form submissions)
const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Testimonial Schema
const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roleCompany: { type: String },
  text: { type: String, required: true },
  rating: { type: Number, default: 5 },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  Admin: mongoose.model('Admin', AdminSchema),
  Profile: mongoose.model('Profile', ProfileSchema),
  Stat: mongoose.model('Stat', StatSchema),
  Experience: mongoose.model('Experience', ExperienceSchema),
  Education: mongoose.model('Education', EducationSchema),
  Skill: mongoose.model('Skill', SkillSchema),
  Project: mongoose.model('Project', ProjectSchema),
  Activity: mongoose.model('Activity', ActivitySchema),
  Message: mongoose.model('Message', MessageSchema),
  Testimonial: mongoose.model('Testimonial', TestimonialSchema)
};

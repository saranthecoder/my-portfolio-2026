const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Admin, Profile, Stat, Experience, Education, Skill, Project, Activity, Message, Testimonial } = require('./models');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'saran_portfolio_secret_key_2026_jwt';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// --- CACHING OPTIMIZATION ---
const cache = {
  profile: null,
  stats: null,
  experiences: null,
  education: null,
  skills: null,
  projects: null,
  testimonials: null,
  activities: null
};

// Automatic cache invalidation middleware for successful mutations
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const path = req.path;
        if (path.startsWith('/api/profile')) cache.profile = null;
        else if (path.startsWith('/api/stats')) cache.stats = null;
        else if (path.startsWith('/api/experiences')) cache.experiences = null;
        else if (path.startsWith('/api/education')) cache.education = null;
        else if (path.startsWith('/api/skills')) cache.skills = null;
        else if (path.startsWith('/api/projects')) cache.projects = null;
        else if (path.startsWith('/api/activities')) cache.activities = null;
        else if (path.startsWith('/api/testimonials')) cache.testimonials = null;
      }
      return originalJson.call(this, data);
    };
  }
  next();
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Database.'))
  .catch(err => console.error('Database connection error:', err));

// --- MULTER STORAGE SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed (jpeg, jpg, png, gif, webp).'));
  }
});

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// ==========================================================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================================================

// Admin Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Password
app.put('/api/auth/update-password', authenticateToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required.' });
    }

    const admin = await Admin.findById(req.user.id);
    const validPassword = await bcrypt.compare(oldPassword, admin.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Incorrect old password.' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check Auth Status
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ status: 'authenticated', username: req.user.username });
});


// ==========================================================================
// 2. PROFILE / ABOUT ENDPOINTS
// ==========================================================================

// Get Profile Settings
app.get('/api/profile', async (req, res) => {
  try {
    if (cache.profile) return res.json(cache.profile);
    let profile = await Profile.findOne({});
    if (!profile) {
      profile = new Profile();
      await profile.save();
    }
    cache.profile = profile;
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Profile Settings (Supports optional profile picture upload)
app.put('/api/profile', authenticateToken, upload.single('profilePictureFile'), async (req, res) => {
  try {
    let profile = await Profile.findOne({});
    if (!profile) {
      profile = new Profile();
    }

    const updates = { ...req.body };
    
    // Parse fellowships if sent as string
    if (typeof updates.fellowships === 'string') {
      try {
        updates.fellowships = JSON.parse(updates.fellowships);
      } catch (e) {
        updates.fellowships = updates.fellowships.split('\n').filter(l => l.trim() !== '');
      }
    }

    // Save profile picture if uploaded
    if (req.file) {
      updates.profilePicture = `/uploads/${req.file.filename}`;
    }

    Object.assign(profile, updates);
    await profile.save();
    res.json({ message: 'Profile updated successfully.', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 3. STATS ENDPOINTS
// ==========================================================================

app.get('/api/stats', async (req, res) => {
  try {
    if (cache.stats) return res.json(cache.stats);
    const stats = await Stat.find({});
    cache.stats = stats;
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stats', authenticateToken, async (req, res) => {
  try {
    const stat = new Stat(req.body);
    await stat.save();
    res.status(201).json(stat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/stats/:id', authenticateToken, async (req, res) => {
  try {
    const stat = await Stat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(stat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/stats/:id', authenticateToken, async (req, res) => {
  try {
    await Stat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Stat deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 4. EXPERIENCES ENDPOINTS
// ==========================================================================

app.get('/api/experiences', async (req, res) => {
  try {
    if (cache.experiences) return res.json(cache.experiences);
    const experiences = await Experience.find({}).sort({ _id: 1 });
    cache.experiences = experiences;
    res.json(experiences);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/experiences', authenticateToken, async (req, res) => {
  try {
    const experienceData = { ...req.body };
    if (typeof experienceData.points === 'string') {
      try {
        experienceData.points = JSON.parse(experienceData.points);
      } catch (e) {
        experienceData.points = experienceData.points.split('\n').filter(p => p.trim() !== '');
      }
    }
    if (typeof experienceData.highlight === 'string') {
      try {
        experienceData.highlight = JSON.parse(experienceData.highlight);
      } catch (e) {}
    }
    const experience = new Experience(experienceData);
    await experience.save();
    res.status(201).json(experience);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/experiences/:id', authenticateToken, async (req, res) => {
  try {
    const experienceData = { ...req.body };
    if (typeof experienceData.points === 'string') {
      try {
        experienceData.points = JSON.parse(experienceData.points);
      } catch (e) {
        experienceData.points = experienceData.points.split('\n').filter(p => p.trim() !== '');
      }
    }
    if (typeof experienceData.highlight === 'string') {
      try {
        experienceData.highlight = JSON.parse(experienceData.highlight);
      } catch (e) {}
    }
    const experience = await Experience.findByIdAndUpdate(req.params.id, experienceData, { new: true });
    res.json(experience);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/experiences/:id', authenticateToken, async (req, res) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.json({ message: 'Experience card deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 5. EDUCATION ENDPOINTS
// ==========================================================================

app.get('/api/education', async (req, res) => {
  try {
    if (cache.education) return res.json(cache.education);
    const education = await Education.find({});
    cache.education = education;
    res.json(education);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/education', authenticateToken, async (req, res) => {
  try {
    const edu = new Education(req.body);
    await edu.save();
    res.status(201).json(edu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/education/:id', authenticateToken, async (req, res) => {
  try {
    const edu = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(edu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/education/:id', authenticateToken, async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ message: 'Education card deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 6. SKILLS ENDPOINTS
// ==========================================================================

app.get('/api/skills', async (req, res) => {
  try {
    if (cache.skills) return res.json(cache.skills);
    const skills = await Skill.find({});
    cache.skills = skills;
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/skills', authenticateToken, async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    res.status(201).json(skill);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 7. PROJECTS ENDPOINTS
// ==========================================================================

app.get('/api/projects', async (req, res) => {
  try {
    if (cache.projects) return res.json(cache.projects);
    const projects = await Project.find({});
    cache.projects = projects;
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Project (Supports single file upload for cover image)
app.post('/api/projects', authenticateToken, upload.single('projectImage'), async (req, res) => {
  try {
    const projectData = { ...req.body };
    
    // Parse tags if sent as string
    if (typeof projectData.tags === 'string') {
      try {
        projectData.tags = JSON.parse(projectData.tags);
      } catch (e) {
        projectData.tags = projectData.tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    if (req.file) {
      projectData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const project = new Project(projectData);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Project
app.put('/api/projects/:id', authenticateToken, upload.single('projectImage'), async (req, res) => {
  try {
    const projectData = { ...req.body };
    
    if (typeof projectData.tags === 'string') {
      try {
        projectData.tags = JSON.parse(projectData.tags);
      } catch (e) {
        projectData.tags = projectData.tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    if (req.file) {
      projectData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, projectData, { new: true });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 8. ACTIVITIES (LinkedIn-style posts) ENDPOINTS
// ==========================================================================

app.get('/api/activities', async (req, res) => {
  try {
    if (cache.activities) return res.json(cache.activities);
    const activities = await Activity.find({}).sort({ datePosted: -1 });
    cache.activities = activities;
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Activity (Supports multiple file upload)
app.post('/api/activities', authenticateToken, upload.array('activityImages', 5), async (req, res) => {
  try {
    const activityData = { ...req.body };
    
    let images = [];
    
    // Add existing/external URLs if provided
    if (activityData.imageUrls) {
      try {
        images = JSON.parse(activityData.imageUrls);
      } catch (e) {
        images = typeof activityData.imageUrls === 'string' ? [activityData.imageUrls] : activityData.imageUrls;
      }
    }

    // Add uploaded files
    if (req.files && req.files.length > 0) {
      const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...fileUrls];
    }

    activityData.images = images;
    
    const activity = new Activity(activityData);
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Activity
app.put('/api/activities/:id', authenticateToken, upload.array('activityImages', 5), async (req, res) => {
  try {
    const activityData = { ...req.body };
    let images = [];
    
    if (activityData.existingImages) {
      try {
        images = JSON.parse(activityData.existingImages);
      } catch (e) {
        images = typeof activityData.existingImages === 'string' ? [activityData.existingImages] : activityData.existingImages;
      }
    }

    // Add newly uploaded files
    if (req.files && req.files.length > 0) {
      const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...fileUrls];
    }

    activityData.images = images;

    const activity = await Activity.findByIdAndUpdate(req.params.id, activityData, { new: true });
    res.json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Activity
app.delete('/api/activities/:id', authenticateToken, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activity post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like Activity (Mock or simple increment counter)
app.post('/api/activities/:id/like', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });
    
    activity.likesCount += 1;
    await activity.save();
    res.json({ id: activity._id, likesCount: activity.likesCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post Comment to Activity
app.post('/api/activities/:id/comments', async (req, res) => {
  try {
    const { name, text } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and comment text are required.' });
    }

    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });

    activity.comments.push({ name, text });
    activity.commentsCount = activity.comments.length;
    await activity.save();

    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Comment from Activity (Admin Only)
app.delete('/api/activities/:id/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found.' });

    // Filter out the comment
    activity.comments = activity.comments.filter(c => c._id.toString() !== req.params.commentId);
    activity.commentsCount = activity.comments.length;
    await activity.save();

    res.json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 9. MESSAGES (Inbox) ENDPOINTS
// ==========================================================================

// Public Form Submission
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const msg = new Message({ name, email, subject, message });
    await msg.save();
    res.status(201).json({ message: 'Message sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Messages (Admin Only)
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Message (Admin Only)
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================================================
// 10. TESTIMONIALS ENDPOINTS
// ==========================================================================

// Create Testimonial (Public submission)
app.post('/api/testimonials', async (req, res) => {
  try {
    const { name, roleCompany, text, rating } = req.body;
    if (!name || !text) {
      return res.status(400).json({ error: 'Name and testimonial text are required.' });
    }
    const testimonial = new Testimonial({
      name,
      roleCompany,
      text,
      rating: rating || 5,
      approved: false // requires admin approval
    });
    await testimonial.save();
    res.status(201).json({ message: 'Testimonial submitted successfully. Waiting for admin approval.', testimonial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Approved Testimonials (Public)
app.get('/api/testimonials', async (req, res) => {
  try {
    if (cache.testimonials) return res.json(cache.testimonials);
    const testimonials = await Testimonial.find({ approved: true }).sort({ createdAt: -1 });
    cache.testimonials = testimonials;
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Testimonials (Admin Only)
app.get('/api/testimonials/all', authenticateToken, async (req, res) => {
  try {
    const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve Testimonial (Admin Only)
app.put('/api/testimonials/:id/approve', authenticateToken, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found.' });
    }
    res.json({ message: 'Testimonial approved successfully.', testimonial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Testimonial (Admin Only)
app.delete('/api/testimonials/:id', authenticateToken, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found.' });
    }
    res.json({ message: 'Testimonial deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

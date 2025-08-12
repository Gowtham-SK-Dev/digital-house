import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  generateResetToken, 
  generateVerificationToken,
  requireAuth,
  sendVerificationEmail,
  sendPasswordResetEmail,
  type AuthRequest
} from "./customAuth";
import { 
  insertPostSchema, 
  insertConnectionSchema, 
  insertEventSchema, 
  insertHelpRequestSchema, 
  insertMessageSchema,
  insertMatrimonyProfileSchema,
  insertJobSchema,
  insertBusinessSchema,
  insertAnnouncementSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Custom Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstName, lastName, email, password, phoneNumber, location, nativePlace, kulam, natchathiram, occupation, role } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "First name, last name, email, and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password and generate verification token
      const passwordHash = await hashPassword(password);
      const emailVerificationToken = generateVerificationToken();

      // Create user
      const userData = {
        firstName,
        lastName,
        email,
        passwordHash,
        phoneNumber,
        location,
        nativePlace,
        kulam,
        natchathiram,
        occupation,
        role: role || 'individual',
        emailVerificationToken,
        emailVerified: false,
      };

      const user = await storage.createUserWithCustomAuth(userData);

      // Send verification email
      await sendVerificationEmail(email, emailVerificationToken, firstName);

      res.status(201).json({ 
        message: "User registered successfully. Please check your email to verify your account.",
        userId: user.id 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      // Set cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000, // 7 days or 1 day
        sameSite: 'strict' as const,
      };

      res.cookie('token', token, cookieOptions);

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({ message: "If an account with that email exists, we've sent a password reset link." });
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token to user
      await storage.setPasswordResetToken(user.id, resetToken, resetExpires);

      // Send reset email
      await sendPasswordResetEmail(email, resetToken, user.firstName || 'User');

      res.json({ message: "If an account with that email exists, we've sent a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.get('/api/auth/validate-reset-token', async (req, res) => {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: "Reset token is required" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.passwordResetExpires || new Date() > user.passwordResetExpires) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      res.json({ message: "Valid reset token" });
    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({ message: "Failed to validate reset token" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const user = await storage.getUserByResetToken(token);
      if (!user || !user.passwordResetExpires || new Date() > user.passwordResetExpires) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      // Hash new password
      const passwordHash = await hashPassword(password);

      // Update password and clear reset token
      await storage.updateUserPassword(user.id, passwordHash);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logout successful" });
  });

  // Auth routes for both systems
  app.get('/api/auth/user', async (req: AuthRequest, res) => {
    try {
      // Try custom auth first
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.token;
      
      if (token) {
        // Custom auth
        const decoded = require('./customAuth').verifyToken(token);
        if (decoded) {
          const user = await storage.getUser(decoded.userId);
          if (user) {
            return res.json(user);
          }
        }
      }

      // Fallback to Replit auth
      if (req.isAuthenticated && req.isAuthenticated()) {
        const userId = (req.user as any)?.claims?.sub;
        if (userId) {
          const user = await storage.getUser(userId);
          return res.json(user);
        }
      }

      res.status(401).json({ message: "Unauthorized" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      const user = await storage.updateUser(userId, updates);
      res.json({ data: user, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/search', isAuthenticated, async (req, res) => {
    try {
      const { q, limit = '10' } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const users = await storage.searchUsers(q, parseInt(limit as string));
      res.json({ data: users });
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  // Posts routes
  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertPostSchema.safeParse({ ...req.body, authorId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid post data", errors: validation.error.issues });
      }

      const post = await storage.createPost(validation.data);
      res.json({ data: post, message: "Post created successfully" });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts', isAuthenticated, async (req, res) => {
    try {
      const { limit = '10', offset = '0' } = req.query;
      const posts = await storage.getPosts(parseInt(limit as string), parseInt(offset as string));
      res.json({ data: posts });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      await storage.likePost(postId, userId);
      res.json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      await storage.unlikePost(postId, userId);
      res.json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  app.delete('/api/posts/:postId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.params;
      await storage.deletePost(postId, userId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Connections routes
  app.post('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertConnectionSchema.safeParse({ ...req.body, requesterId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid connection data", errors: validation.error.issues });
      }

      const connection = await storage.sendConnectionRequest(validation.data.requesterId, validation.data.receiverId);
      res.json({ data: connection, message: "Connection request sent successfully" });
    } catch (error) {
      console.error("Error sending connection request:", error);
      res.status(500).json({ message: "Failed to send connection request" });
    }
  });

  app.get('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connections = await storage.getUserConnections(userId);
      res.json({ data: connections });
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.get('/api/connections/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pendingRequests = await storage.getPendingConnectionRequests(userId);
      res.json({ data: pendingRequests });
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      res.status(500).json({ message: "Failed to fetch pending requests" });
    }
  });

  app.put('/api/connections/:connectionId/accept', isAuthenticated, async (req, res) => {
    try {
      const { connectionId } = req.params;
      const connection = await storage.acceptConnectionRequest(connectionId);
      res.json({ data: connection, message: "Connection request accepted" });
    } catch (error) {
      console.error("Error accepting connection:", error);
      res.status(500).json({ message: "Failed to accept connection" });
    }
  });

  app.put('/api/connections/:connectionId/reject', isAuthenticated, async (req, res) => {
    try {
      const { connectionId } = req.params;
      const connection = await storage.rejectConnectionRequest(connectionId);
      res.json({ data: connection, message: "Connection request rejected" });
    } catch (error) {
      console.error("Error rejecting connection:", error);
      res.status(500).json({ message: "Failed to reject connection" });
    }
  });

  // Events routes
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertEventSchema.safeParse({ ...req.body, organizerId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid event data", errors: validation.error.issues });
      }

      const event = await storage.createEvent(validation.data);
      res.json({ data: event, message: "Event created successfully" });
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const { limit = '10' } = req.query;
      const events = await storage.getEvents(parseInt(limit as string));
      res.json({ data: events });
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events/:eventId/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { eventId } = req.params;
      const { status = 'attending' } = req.body;
      
      await storage.rsvpToEvent(eventId, userId, status);
      res.json({ message: "RSVP updated successfully" });
    } catch (error) {
      console.error("Error updating RSVP:", error);
      res.status(500).json({ message: "Failed to update RSVP" });
    }
  });

  // Help requests routes
  app.post('/api/help-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertHelpRequestSchema.safeParse({ ...req.body, requesterId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid help request data", errors: validation.error.issues });
      }

      const helpRequest = await storage.createHelpRequest(validation.data);
      res.json({ data: helpRequest, message: "Help request created successfully" });
    } catch (error) {
      console.error("Error creating help request:", error);
      res.status(500).json({ message: "Failed to create help request" });
    }
  });

  app.get('/api/help-requests', isAuthenticated, async (req, res) => {
    try {
      const helpRequests = await storage.getActiveHelpRequests();
      res.json({ data: helpRequests });
    } catch (error) {
      console.error("Error fetching help requests:", error);
      res.status(500).json({ message: "Failed to fetch help requests" });
    }
  });

  app.post('/api/help-requests/:helpRequestId/respond', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { helpRequestId } = req.params;
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Response message is required" });
      }
      
      await storage.respondToHelpRequest(helpRequestId, userId, message);
      res.json({ message: "Response sent successfully" });
    } catch (error) {
      console.error("Error responding to help request:", error);
      res.status(500).json({ message: "Failed to send response" });
    }
  });

  // Messages routes
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMessageSchema.safeParse({ ...req.body, senderId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validation.error.issues });
      }

      const message = await storage.sendMessage(validation.data);
      res.json({ data: message, message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getUserMessages(userId);
      res.json({ data: messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Version 2.0 Routes - Matrimony
  app.get('/api/matrimony/profiles', isAuthenticated, async (req, res) => {
    try {
      const profiles = await storage.getMatrimonyProfiles();
      res.json({ data: profiles });
    } catch (error) {
      console.error("Error fetching matrimony profiles:", error);
      res.status(500).json({ message: "Failed to fetch matrimony profiles" });
    }
  });

  app.get('/api/matrimony/my-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getMatrimonyProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching matrimony profile:", error);
      res.status(500).json({ message: "Failed to fetch matrimony profile" });
    }
  });

  app.post('/api/matrimony/profiles/:profileId/interest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { profileId } = req.params;
      const { message = '' } = req.body;
      
      await storage.expressMatrimonyInterest(userId, profileId, message);
      res.json({ message: "Interest expressed successfully" });
    } catch (error) {
      console.error("Error expressing interest:", error);
      res.status(500).json({ message: "Failed to express interest" });
    }
  });

  // Version 2.0 Routes - Jobs
  app.get('/api/jobs', isAuthenticated, async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json({ data: jobs });
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertJobSchema.safeParse({ ...req.body, postedById: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid job data", errors: validation.error.issues });
      }

      const job = await storage.createJob(validation.data);
      res.json({ data: job, message: "Job posted successfully" });
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.post('/api/jobs/:jobId/apply', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { jobId } = req.params;
      const { coverLetter = '' } = req.body;
      
      await storage.applyToJob(jobId, userId, coverLetter);
      res.json({ message: "Application submitted successfully" });
    } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ message: "Failed to apply to job" });
    }
  });

  app.get('/api/jobs/my-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applications = await storage.getUserJobApplications(userId);
      res.json({ data: applications });
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  // Version 2.0 Routes - Business Hub
  app.get('/api/businesses', isAuthenticated, async (req, res) => {
    try {
      const businesses = await storage.getBusinesses();
      res.json({ data: businesses });
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ message: "Failed to fetch businesses" });
    }
  });

  app.get('/api/businesses/categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getBusinessCategories();
      res.json({ data: categories });
    } catch (error) {
      console.error("Error fetching business categories:", error);
      res.status(500).json({ message: "Failed to fetch business categories" });
    }
  });

  app.post('/api/businesses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertBusinessSchema.safeParse({ ...req.body, ownerId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid business data", errors: validation.error.issues });
      }

      const business = await storage.createBusiness(validation.data);
      res.json({ data: business, message: "Business created successfully" });
    } catch (error) {
      console.error("Error creating business:", error);
      res.status(500).json({ message: "Failed to create business" });
    }
  });

  app.post('/api/businesses/:businessId/contact', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { businessId } = req.params;
      const { message = '' } = req.body;
      
      await storage.contactBusiness(businessId, userId, message);
      res.json({ message: "Contact request sent successfully" });
    } catch (error) {
      console.error("Error contacting business:", error);
      res.status(500).json({ message: "Failed to contact business" });
    }
  });

  // Announcements routes
  app.get('/api/announcements', async (req, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json({ data: announcements });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.get('/api/announcements/all', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      
      // Only admins and moderators can view all announcements
      if (user?.userType !== 'admin' && user?.userType !== 'moderator') {
        return res.status(403).json({ message: "Access denied" });
      }

      const announcements = await storage.getAnnouncements();
      res.json({ data: announcements });
    } catch (error) {
      console.error("Error fetching all announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/announcements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only admins and moderators can create announcements
      if (user?.userType !== 'admin' && user?.userType !== 'moderator') {
        return res.status(403).json({ message: "Access denied" });
      }

      const validation = insertAnnouncementSchema.safeParse({ ...req.body, authorId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid announcement data", errors: validation.error.issues });
      }

      const announcement = await storage.createAnnouncement(validation.data);
      res.json({ data: announcement, message: "Announcement created successfully" });
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.put('/api/announcements/:announcementId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { announcementId } = req.params;
      
      // Only admins and moderators can update announcements
      if (user?.userType !== 'admin' && user?.userType !== 'moderator') {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = req.body;
      const announcement = await storage.updateAnnouncement(announcementId, updates);
      res.json({ data: announcement, message: "Announcement updated successfully" });
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:announcementId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const { announcementId } = req.params;
      
      // Only admins and moderators can delete announcements
      if (user?.userType !== 'admin' && user?.userType !== 'moderator') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteAnnouncement(announcementId, userId);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Messages routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getUserMessages(userId);
      res.json({ data: messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = insertMessageSchema.safeParse({ ...req.body, senderId: userId });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validation.error.issues });
      }

      const message = await storage.sendMessage(validation.data);
      res.json({ data: message, message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/messages/:messageId/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { messageId } = req.params;
      await storage.markMessageAsRead(messageId, userId);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Development-only route to create sample data
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/dev/create-sample-data', async (req, res) => {
      try {
        const { createSampleData } = await import('./sampleData');
        await createSampleData();
        res.json({ message: "Sample data created successfully!" });
      } catch (error) {
        console.error("Error creating sample data:", error);
        res.status(500).json({ message: "Failed to create sample data" });
      }
    });
  }

  // User search route
  app.get('/api/users/search', async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json({ data: [] });
      }
      const users = await storage.searchUsers(q, 20);
      res.json({ data: users });
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPostSchema, insertConnectionSchema, insertEventSchema, insertHelpRequestSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
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

  app.get('/api/messages/:otherUserId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { otherUserId } = req.params;
      const messages = await storage.getUserMessages(userId, otherUserId);
      res.json({ data: messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

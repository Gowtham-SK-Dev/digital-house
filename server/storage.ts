import {
  users,
  posts,
  connections,
  events,
  eventRsvps,
  helpRequests,
  helpResponses,
  messages,
  postLikes,
  postComments,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Connection,
  type InsertConnection,
  type Event,
  type InsertEvent,
  type HelpRequest,
  type InsertHelpRequest,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  searchUsers(query: string, limit?: number): Promise<User[]>;
  
  // Posts operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getUserPosts(userId: string, limit?: number): Promise<Post[]>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  deletePost(postId: string, userId: string): Promise<void>;
  
  // Connections operations
  sendConnectionRequest(requesterId: string, receiverId: string): Promise<Connection>;
  acceptConnectionRequest(connectionId: string): Promise<Connection>;
  rejectConnectionRequest(connectionId: string): Promise<Connection>;
  getUserConnections(userId: string): Promise<Connection[]>;
  getPendingConnectionRequests(userId: string): Promise<Connection[]>;
  
  // Events operations
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(limit?: number): Promise<Event[]>;
  getUserEvents(userId: string): Promise<Event[]>;
  rsvpToEvent(eventId: string, userId: string, status: string): Promise<void>;
  
  // Help requests operations
  createHelpRequest(helpRequest: InsertHelpRequest): Promise<HelpRequest>;
  getActiveHelpRequests(): Promise<HelpRequest[]>;
  getUserHelpRequests(userId: string): Promise<HelpRequest[]>;
  respondToHelpRequest(helpRequestId: string, responderId: string, message: string): Promise<void>;
  
  // Messages operations
  sendMessage(message: InsertMessage): Promise<Message>;
  getUserMessages(userId: string, otherUserId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          like(users.firstName, `%${query}%`),
          like(users.lastName, `%${query}%`),
          like(users.location, `%${query}%`),
          like(users.occupation, `%${query}%`),
          like(users.nativePlace, `%${query}%`)
        )
      )
      .limit(limit);
  }

  // Posts operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  async getPosts(limit: number = 10, offset: number = 0): Promise<Post[]> {
    return await db
      .select({
        id: posts.id,
        authorId: posts.authorId,
        content: posts.content,
        postType: posts.postType,
        mediaUrl: posts.mediaUrl,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getUserPosts(userId: string, limit: number = 10): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async likePost(postId: string, userId: string): Promise<void> {
    await db.insert(postLikes).values({ postId, userId });
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} + 1` })
      .where(eq(posts.id, postId));
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    await db
      .update(posts)
      .set({ likesCount: sql`${posts.likesCount} - 1` })
      .where(eq(posts.id, postId));
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.authorId, userId)));
  }

  // Connections operations
  async sendConnectionRequest(requesterId: string, receiverId: string): Promise<Connection> {
    const [connection] = await db
      .insert(connections)
      .values({ requesterId, receiverId })
      .returning();
    return connection;
  }

  async acceptConnectionRequest(connectionId: string): Promise<Connection> {
    const [connection] = await db
      .update(connections)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(connections.id, connectionId))
      .returning();
    return connection;
  }

  async rejectConnectionRequest(connectionId: string): Promise<Connection> {
    const [connection] = await db
      .update(connections)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(connections.id, connectionId))
      .returning();
    return connection;
  }

  async getUserConnections(userId: string): Promise<Connection[]> {
    return await db
      .select({
        id: connections.id,
        requesterId: connections.requesterId,
        receiverId: connections.receiverId,
        status: connections.status,
        createdAt: connections.createdAt,
        updatedAt: connections.updatedAt,
        requester: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(connections)
      .leftJoin(users, eq(connections.requesterId, users.id))
      .where(
        and(
          or(eq(connections.requesterId, userId), eq(connections.receiverId, userId)),
          eq(connections.status, 'accepted')
        )
      );
  }

  async getPendingConnectionRequests(userId: string): Promise<Connection[]> {
    return await db
      .select({
        id: connections.id,
        requesterId: connections.requesterId,
        receiverId: connections.receiverId,
        status: connections.status,
        createdAt: connections.createdAt,
        updatedAt: connections.updatedAt,
        requester: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(connections)
      .leftJoin(users, eq(connections.requesterId, users.id))
      .where(
        and(
          eq(connections.receiverId, userId),
          eq(connections.status, 'pending')
        )
      );
  }

  // Events operations
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvents(limit: number = 10): Promise<Event[]> {
    return await db
      .select({
        id: events.id,
        organizerId: events.organizerId,
        title: events.title,
        description: events.description,
        location: events.location,
        startDate: events.startDate,
        endDate: events.endDate,
        maxAttendees: events.maxAttendees,
        currentAttendees: events.currentAttendees,
        isPublic: events.isPublic,
        ticketPrice: events.ticketPrice,
        status: events.status,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        organizer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.isPublic, true))
      .orderBy(events.startDate)
      .limit(limit);
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.organizerId, userId))
      .orderBy(events.startDate);
  }

  async rsvpToEvent(eventId: string, userId: string, status: string): Promise<void> {
    await db
      .insert(eventRsvps)
      .values({ eventId, userId, status })
      .onConflictDoUpdate({
        target: [eventRsvps.eventId, eventRsvps.userId],
        set: { status }
      });

    // Update current attendees count
    const attendeesCount = await db
      .select({ count: count() })
      .from(eventRsvps)
      .where(
        and(
          eq(eventRsvps.eventId, eventId),
          eq(eventRsvps.status, 'attending')
        )
      );

    await db
      .update(events)
      .set({ currentAttendees: attendeesCount[0].count })
      .where(eq(events.id, eventId));
  }

  // Help requests operations
  async createHelpRequest(helpRequest: InsertHelpRequest): Promise<HelpRequest> {
    const [newHelpRequest] = await db.insert(helpRequests).values(helpRequest).returning();
    return newHelpRequest;
  }

  async getActiveHelpRequests(): Promise<HelpRequest[]> {
    return await db
      .select({
        id: helpRequests.id,
        requesterId: helpRequests.requesterId,
        title: helpRequests.title,
        description: helpRequests.description,
        type: helpRequests.type,
        location: helpRequests.location,
        urgencyLevel: helpRequests.urgencyLevel,
        status: helpRequests.status,
        createdAt: helpRequests.createdAt,
        updatedAt: helpRequests.updatedAt,
        requester: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          location: users.location,
        }
      })
      .from(helpRequests)
      .leftJoin(users, eq(helpRequests.requesterId, users.id))
      .where(eq(helpRequests.status, 'active'))
      .orderBy(desc(helpRequests.urgencyLevel), desc(helpRequests.createdAt));
  }

  async getUserHelpRequests(userId: string): Promise<HelpRequest[]> {
    return await db
      .select()
      .from(helpRequests)
      .where(eq(helpRequests.requesterId, userId))
      .orderBy(desc(helpRequests.createdAt));
  }

  async respondToHelpRequest(helpRequestId: string, responderId: string, message: string): Promise<void> {
    await db.insert(helpResponses).values({
      helpRequestId,
      responderId,
      message
    });
  }

  // Messages operations
  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getUserMessages(userId: string, otherUserId: string): Promise<Message[]> {
    return await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
          and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
        )
      )
      .orderBy(messages.createdAt);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }
}

export const storage = new DatabaseStorage();

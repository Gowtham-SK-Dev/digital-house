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
  matrimonyProfiles,
  jobs,
  businesses,
  jobApplications,
  matrimonyInterests,
  announcements,
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
  type MatrimonyProfile,
  type InsertMatrimonyProfile,
  type Job,
  type InsertJob,
  type Business,
  type InsertBusiness,
  type Announcement,
  type InsertAnnouncement,
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
  getUserMessages(userId: string): Promise<Message[]>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  
  // Version 2.0 - Matrimony operations
  getMatrimonyProfiles(): Promise<MatrimonyProfile[]>;
  getMatrimonyProfile(userId: string): Promise<MatrimonyProfile | undefined>;
  createMatrimonyProfile(profile: InsertMatrimonyProfile): Promise<MatrimonyProfile>;
  expressMatrimonyInterest(fromUserId: string, toUserId: string, message: string): Promise<void>;
  
  // Version 2.0 - Jobs operations
  getJobs(): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  applyToJob(jobId: string, applicantId: string, coverLetter: string): Promise<void>;
  getUserJobApplications(userId: string): Promise<any[]>;
  
  // Version 2.0 - Business operations
  getBusinesses(): Promise<Business[]>;
  getBusinessCategories(): Promise<string[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  contactBusiness(businessId: string, userId: string, message: string): Promise<void>;
  
  // Announcements operations
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  getAnnouncements(): Promise<Announcement[]>;
  getActiveAnnouncements(): Promise<Announcement[]>;
  updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement>;
  deleteAnnouncement(id: string, userId: string): Promise<void>;
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

  async getUserMessages(userId: string): Promise<Message[]> {
    return await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        sender: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        receiver: {
          firstName: sql<string>`receiver.first_name`,
          lastName: sql<string>`receiver.last_name`,
          profileImageUrl: sql<string>`receiver.profile_image_url`,
        }
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(sql`users AS receiver`, sql`messages.receiver_id = receiver.id`)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  // Version 2.0 - Matrimony operations
  async getMatrimonyProfiles(): Promise<MatrimonyProfile[]> {
    const profiles = await db
      .select({
        id: matrimonyProfiles.id,
        userId: matrimonyProfiles.userId,
        age: matrimonyProfiles.age,
        height: matrimonyProfiles.height,
        education: matrimonyProfiles.education,
        interests: matrimonyProfiles.interests,
        lookingFor: matrimonyProfiles.lookingFor,
        isActive: matrimonyProfiles.isActive,
        createdAt: matrimonyProfiles.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        location: users.location,
        nativePlace: users.nativePlace,
        kulam: users.kulam,
        natchathiram: users.natchathiram,
        occupation: users.occupation,
      })
      .from(matrimonyProfiles)
      .innerJoin(users, eq(matrimonyProfiles.userId, users.id))
      .where(eq(matrimonyProfiles.isActive, true));
    
    return profiles as any[];
  }

  async getMatrimonyProfile(userId: string): Promise<MatrimonyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(matrimonyProfiles)
      .where(eq(matrimonyProfiles.userId, userId));
    return profile;
  }

  async createMatrimonyProfile(profile: InsertMatrimonyProfile): Promise<MatrimonyProfile> {
    const [newProfile] = await db
      .insert(matrimonyProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async expressMatrimonyInterest(fromUserId: string, toUserId: string, message: string): Promise<void> {
    await db.insert(matrimonyInterests).values({
      fromUserId,
      toUserId,
      message,
      status: 'pending',
    });
  }

  // Version 2.0 - Jobs operations
  async getJobs(): Promise<Job[]> {
    const jobsList = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        companyLogo: jobs.companyLogo,
        description: jobs.description,
        location: jobs.location,
        type: jobs.type,
        experienceLevel: jobs.experienceLevel,
        salaryRange: jobs.salaryRange,
        skills: jobs.skills,
        benefits: jobs.benefits,
        postedById: jobs.postedById,
        applicationsCount: jobs.applicationsCount,
        isUrgent: jobs.isUrgent,
        isRemote: jobs.isRemote,
        createdAt: jobs.createdAt,
        postedBy: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.postedById, users.id))
      .orderBy(desc(jobs.createdAt));
    
    return jobsList as any[];
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db
      .insert(jobs)
      .values(job)
      .returning();
    return newJob;
  }

  async applyToJob(jobId: string, applicantId: string, coverLetter: string): Promise<void> {
    await db.insert(jobApplications).values({
      jobId,
      applicantId,
      coverLetter,
      status: 'pending',
    });

    // Increment applications count
    await db
      .update(jobs)
      .set({ 
        applicationsCount: sql`${jobs.applicationsCount} + 1`
      })
      .where(eq(jobs.id, jobId));
  }

  async getUserJobApplications(userId: string): Promise<any[]> {
    const applications = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.applicantId, userId))
      .orderBy(desc(jobApplications.createdAt));
    
    return applications;
  }

  // Version 2.0 - Business operations
  async getBusinesses(): Promise<Business[]> {
    const businessList = await db
      .select({
        id: businesses.id,
        ownerId: businesses.ownerId,
        businessName: businesses.businessName,
        businessLogo: businesses.businessLogo,
        category: businesses.category,
        description: businesses.description,
        location: businesses.location,
        website: businesses.website,
        phone: businesses.phone,
        email: businesses.email,
        services: businesses.services,
        yearEstablished: businesses.yearEstablished,
        employeeCount: businesses.employeeCount,
        rating: businesses.rating,
        reviewsCount: businesses.reviewsCount,
        isVerified: businesses.isVerified,
        isFeatured: businesses.isFeatured,
        socialMedia: businesses.socialMedia,
        createdAt: businesses.createdAt,
        owner: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(businesses)
      .innerJoin(users, eq(businesses.ownerId, users.id))
      .orderBy(desc(businesses.isFeatured), desc(businesses.createdAt));
    
    return businessList as any[];
  }

  async getBusinessCategories(): Promise<string[]> {
    const categories = await db
      .selectDistinct({ category: businesses.category })
      .from(businesses);
    
    return categories.map(c => c.category).filter(Boolean);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db
      .insert(businesses)
      .values(business)
      .returning();
    return newBusiness;
  }

  async contactBusiness(businessId: string, userId: string, message: string): Promise<void> {
    // For now, we'll create a message entry. In a real app, this might send an email or notification
    const business = await db
      .select({ ownerId: businesses.ownerId })
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    
    if (business[0]) {
      await db.insert(messages).values({
        senderId: userId,
        receiverId: business[0].ownerId,
        content: `Business Contact Request: ${message}`,
      });
    }
  }

  // Announcements operations
  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [newAnnouncement] = await db
      .insert(announcements)
      .values(announcement)
      .returning();
    return newAnnouncement;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const announcementsList = await db
      .select({
        id: announcements.id,
        authorId: announcements.authorId,
        title: announcements.title,
        content: announcements.content,
        priority: announcements.priority,
        isActive: announcements.isActive,
        isPinned: announcements.isPinned,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        author: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          userType: users.userType,
        }
      })
      .from(announcements)
      .innerJoin(users, eq(announcements.authorId, users.id))
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
    
    return announcementsList as any[];
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    const activeAnnouncements = await db
      .select({
        id: announcements.id,
        authorId: announcements.authorId,
        title: announcements.title,
        content: announcements.content,
        priority: announcements.priority,
        isActive: announcements.isActive,
        isPinned: announcements.isPinned,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,
        updatedAt: announcements.updatedAt,
        author: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          userType: users.userType,
        }
      })
      .from(announcements)
      .innerJoin(users, eq(announcements.authorId, users.id))
      .where(
        and(
          eq(announcements.isActive, true),
          or(
            sql`${announcements.expiresAt} IS NULL`,
            sql`${announcements.expiresAt} > NOW()`
          )
        )
      )
      .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
    
    return activeAnnouncements as any[];
  }

  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement> {
    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return updatedAnnouncement;
  }

  async deleteAnnouncement(id: string, userId: string): Promise<void> {
    await db
      .delete(announcements)
      .where(
        and(
          eq(announcements.id, id),
          eq(announcements.authorId, userId)
        )
      );
  }
}

export const storage = new DatabaseStorage();

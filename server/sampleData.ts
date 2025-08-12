import { storage } from "./storage";

export async function createSampleData() {
  console.log("Creating sample data for Digital House...");

  try {
    // Sample users for the community
    const sampleUsers = [
      {
        id: "sample-user-1",
        email: "priya.tamil@gmail.com",
        firstName: "Priya",
        lastName: "Kumari",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
        role: "individual" as const,
        userType: "member" as const,
        nativePlace: "Coimbatore",
        kulam: "Brahmin",
        natchathiram: "Rohini",
        occupation: "Software Engineer",
        aboutMe: "Software engineer passionate about Tamil culture and community building. Love organizing cultural events.",
        location: "San Francisco, CA",
        phoneNumber: "+1-555-0101",
        profileVisibility: "public" as const,
        isVerified: true,
      },
      {
        id: "sample-user-2", 
        email: "ravi.business@gmail.com",
        firstName: "Ravi",
        lastName: "Shankar",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        role: "business" as const,
        userType: "member" as const,
        nativePlace: "Chennai",
        kulam: "Chettiar",
        natchathiram: "Bharani",
        occupation: "Restaurant Owner",
        aboutMe: "Running authentic South Indian restaurant chain. Active in supporting new entrepreneurs.",
        location: "Toronto, Canada", 
        phoneNumber: "+1-416-555-0102",
        profileVisibility: "public" as const,
        isVerified: true,
      },
      {
        id: "sample-user-3",
        email: "meera.doctor@gmail.com", 
        firstName: "Meera",
        lastName: "Iyer",
        profileImageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        role: "individual" as const,
        userType: "member" as const,
        nativePlace: "Madurai",
        kulam: "Iyer",
        natchathiram: "Pushya",
        occupation: "Cardiologist",
        aboutMe: "Cardiologist who volunteers for medical camps in the community. Mother of two.",
        location: "London, UK",
        phoneNumber: "+44-20-555-0103",
        profileVisibility: "public" as const,
        isVerified: true,
      },
      {
        id: "sample-user-4",
        email: "vikram.tech@gmail.com",
        firstName: "Vikram",
        lastName: "Patel",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        role: "individual" as const,
        userType: "member" as const,
        nativePlace: "Salem",
        kulam: "Vanniyar",
        natchathiram: "Mrigashira",
        occupation: "AI Researcher",
        aboutMe: "AI researcher working on healthcare applications. Looking to connect with tech entrepreneurs.",
        location: "Austin, TX",
        phoneNumber: "+1-512-555-0104", 
        profileVisibility: "public" as const,
        isVerified: true,
      },
      {
        id: "sample-user-5",
        email: "anita.teacher@gmail.com",
        firstName: "Anita", 
        lastName: "Krishnan",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        role: "individual" as const,
        userType: "moderator" as const,
        nativePlace: "Trichy",
        kulam: "Mudaliar",
        natchathiram: "Ashwini",
        occupation: "Tamil Language Teacher",
        aboutMe: "Dedicated to preserving Tamil language and culture. Teaching Tamil to kids in diaspora.",
        location: "Sydney, Australia",
        phoneNumber: "+61-2-555-0105",
        profileVisibility: "public" as const,
        isVerified: true,
      }
    ];

    // Create sample users
    for (const user of sampleUsers) {
      await storage.upsertUser(user);
    }

    // Sample posts showcasing community activity
    const samplePosts = [
      {
        authorId: "sample-user-1",
        content: "🎉 Just organized a successful Bharatanatyam workshop for our kids here in SF! Amazing to see 25+ children learning our beautiful art form. Next workshop will be on classical music. Who's interested? #TamilCulture #BharatanatyamSF",
        postType: "text" as const,
      },
      {
        authorId: "sample-user-2", 
        content: "Our restaurant is sponsoring free meals for students during exam season! If you know any Tamil students in Toronto area who need support, please DM me. Community first! 🍛❤️ #CommunitySupport #TorontoTamils",
        postType: "text" as const,
      },
      {
        authorId: "sample-user-3",
        content: "Medical camp update: Successfully provided free health checkups to 150+ community members last weekend. Special thanks to Dr. Suresh and nurse Kamala for volunteering! Next camp planned for December. #HealthForAll #CommunityService",
        postType: "text" as const,
      },
      {
        authorId: "sample-user-4",
        content: "Excited to share our AI project is being used to translate ancient Tamil texts! Technology meeting tradition 🤖📜 Looking for Tamil literature experts to collaborate. Please reach out! #TamilTech #ArtificialIntelligence",
        postType: "text" as const,
      },
      {
        authorId: "sample-user-5",
        content: "Registration now open for online Tamil classes for children (ages 5-15)! Interactive sessions every Saturday. Building the next generation of Tamil speakers globally 🌍 Link in comments #TamilEducation #OnlineLearning",
        postType: "text" as const,
      },
      {
        authorId: "sample-user-1",
        content: "Beautiful Diwali celebration at our local temple! The rangoli competition was fierce 😄 Congratulations to all winners. Festival unites us no matter how far from home we are ✨ #Diwali2024 #TamilFestival",
        postType: "text" as const,
      }
    ];

    // Create sample posts
    for (const post of samplePosts) {
      await storage.createPost(post);
    }

    // Sample events
    const sampleEvents = [
      {
        organizerId: "sample-user-1",
        title: "Tamil New Year Celebration 2024",
        description: "Join us for a grand Tamil New Year celebration with traditional food, music, and cultural performances. Families welcome! Free entry for children under 12.",
        location: "San Francisco Community Center, 1234 Mission St",
        startDate: new Date("2024-04-14T10:00:00Z"),
        endDate: new Date("2024-04-14T16:00:00Z"),
        maxAttendees: 200,
        currentAttendees: 85,
        isPublic: true,
        ticketPrice: 2500, // $25 in cents
        status: "upcoming" as const,
      },
      {
        organizerId: "sample-user-2", 
        title: "Entrepreneurs Meet & Greet",
        description: "Monthly networking event for Tamil entrepreneurs and business owners. Share experiences, find partners, and grow together. Light refreshments provided.",
        location: "Toronto Business Hub, 567 King St W",
        startDate: new Date("2024-02-20T18:00:00Z"),
        endDate: new Date("2024-02-20T21:00:00Z"),
        maxAttendees: 50,
        currentAttendees: 32,
        isPublic: true,
        ticketPrice: 0,
        status: "upcoming" as const,
      },
      {
        organizerId: "sample-user-3",
        title: "Free Health Screening Camp",
        description: "Comprehensive health checkup including blood pressure, diabetes screening, and general consultation. Volunteer doctors and nurses from our community.",
        location: "London Tamil Association, 89 High St",
        startDate: new Date("2024-03-10T09:00:00Z"),
        endDate: new Date("2024-03-10T15:00:00Z"),
        maxAttendees: 100,
        currentAttendees: 67,
        isPublic: true,
        ticketPrice: 0,
        status: "upcoming" as const,
      },
      {
        organizerId: "sample-user-5",
        title: "Tamil Literature Book Club",
        description: "Monthly discussion of classic and contemporary Tamil literature. This month: 'Ponniyin Selvan' by Kalki. Open to all Tamil literature enthusiasts.",
        location: "Online via Zoom",
        startDate: new Date("2024-02-25T19:00:00Z"),
        endDate: new Date("2024-02-25T21:00:00Z"),
        maxAttendees: 30,
        currentAttendees: 18,
        isPublic: true,
        ticketPrice: 0,
        status: "upcoming" as const,
      }
    ];

    // Create sample events
    for (const event of sampleEvents) {
      await storage.createEvent(event);
    }

    // Sample help requests
    const sampleHelpRequests = [
      {
        requesterId: "sample-user-3",
        title: "Blood Donation Urgent - O+ Needed",
        description: "Community member's father needs urgent blood transfusion. O+ blood type required at Toronto General Hospital. Please contact immediately if you can help.",
        type: "medical" as const,
        location: "Toronto, ON, Canada",
        urgencyLevel: 5,
        status: "active" as const,
      },
      {
        requesterId: "sample-user-4",
        title: "Airport Pickup Help in London",
        description: "Elderly couple arriving at Heathrow tomorrow (Feb 15) at 2 PM. Their son got delayed due to work emergency. Can someone help with pickup and drop at hotel?",
        type: "travel" as const,
        location: "London Heathrow Airport",
        urgencyLevel: 3,
        status: "active" as const,
      },
      {
        requesterId: "sample-user-1",
        title: "Temporary Housing for Student",
        description: "Tamil student from Chennai coming for 3-month internship in SF. Looking for temporary accommodation or host family. Clean, respectful, and willing to help with household work.",
        type: "other" as const,
        location: "San Francisco Bay Area",
        urgencyLevel: 2,
        status: "active" as const,
      }
    ];

    // Create sample help requests
    for (const helpRequest of sampleHelpRequests) {
      await storage.createHelpRequest(helpRequest);
    }

    // Sample matrimony profiles (V2.0 feature)
    const sampleMatrimonyProfiles = [
      {
        userId: "sample-user-1",
        age: 28,
        height: "5'6\"",
        education: "Master's in Computer Science",
        interests: ["Classical Dance", "Cooking", "Travel", "Photography"],
        lookingFor: "Looking for someone who values family traditions and has career ambitions. Preference for someone from Tamil background who can appreciate our culture.",
        isActive: true,
      },
      {
        userId: "sample-user-4",
        age: 31,
        height: "5'10\"",
        education: "PhD in Artificial Intelligence",
        interests: ["Technology", "Chess", "Classical Music", "Cricket"],
        lookingFor: "Seeking a life partner who is educated, independent, and shares similar values. Open to long-distance initially with plans to settle together.",
        isActive: true,
      }
    ];

    // Create sample matrimony profiles
    for (const profile of sampleMatrimonyProfiles) {
      await storage.createMatrimonyProfile(profile);
    }

    // Sample jobs (V2.0 feature)
    const sampleJobs = [
      {
        title: "Senior Software Engineer - Tamil Fintech",
        company: "TamilPay Inc",
        companyLogo: "https://images.unsplash.com/photo-1616077064133-2583af65fc77?w=100&h=100&fit=crop",
        description: "Join our mission to build financial tools for Tamil diaspora. Work on mobile payments, remittances, and digital banking. Tamil language skills preferred but not required.",
        location: "Remote (Global)",
        type: "full-time",
        experienceLevel: "senior",
        salaryRange: "$120,000 - $160,000",
        skills: ["React", "Node.js", "Python", "AWS", "Tamil Language"],
        benefits: ["Health Insurance", "Remote Work", "Tamil Cultural Time Off", "Professional Development"],
        postedById: "sample-user-2",
        applicationsCount: 12,
        isUrgent: false,
        isRemote: true,
      },
      {
        title: "Tamil Content Creator",
        company: "Cultural Media House",
        description: "Create engaging Tamil content for digital platforms. Write scripts, manage social media, and help preserve our language in digital space.",
        location: "Toronto, Canada",
        type: "part-time",
        experienceLevel: "mid",
        salaryRange: "CAD $40,000 - $55,000",
        skills: ["Tamil Writing", "Content Creation", "Social Media", "Video Editing"],
        benefits: ["Flexible Hours", "Creative Freedom", "Cultural Impact"],
        postedById: "sample-user-5",
        applicationsCount: 8,
        isUrgent: true,
        isRemote: false,
      },
      {
        title: "Community Health Coordinator",
        company: "Tamil Health Network",
        description: "Coordinate health programs for Tamil community. Organize medical camps, health education sessions, and connect families with healthcare resources.",
        location: "London, UK",
        type: "full-time",
        experienceLevel: "entry",
        salaryRange: "£35,000 - £45,000",
        skills: ["Healthcare Administration", "Community Outreach", "Tamil/English", "Event Planning"],
        benefits: ["NHS Benefits", "Community Impact", "Professional Training", "Tamil Cultural Leave"],
        postedById: "sample-user-3",
        applicationsCount: 15,
        isUrgent: false,
        isRemote: false,
      }
    ];

    // Create sample jobs
    for (const job of sampleJobs) {
      await storage.createJob(job);
    }

    // Sample businesses (V2.0 feature)
    const sampleBusinesses = [
      {
        ownerId: "sample-user-2",
        businessName: "Tamilnadu Authentic Kitchen",
        businessLogo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=150&h=150&fit=crop",
        category: "Food & Restaurant",
        description: "Authentic Tamil cuisine restaurant chain serving traditional dishes from different regions of Tamil Nadu. Catering services available for events and celebrations.",
        location: "Toronto, Canada (Multiple Locations)",
        website: "https://tamilnadu-kitchen.com",
        phone: "+1-416-555-FOOD",
        email: "info@tamilnadu-kitchen.com",
        services: ["Dine-in", "Takeout", "Catering", "Event Planning", "Cooking Classes"],
        yearEstablished: 2018,
        employeeCount: "25-50",
        rating: 4,
        reviewsCount: 156,
        isVerified: true,
        isFeatured: true,
        socialMedia: {
          instagram: "@tamilnadu_kitchen",
          facebook: "TamilnaduKitchen",
          youtube: "TamilnaduKitchenTV"
        },
      },
      {
        ownerId: "sample-user-1",
        businessName: "Digital Solutions Tamil",
        businessLogo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&h=150&fit=crop",
        category: "Technology",
        description: "Custom software development with focus on Tamil language applications. Specializing in educational apps, business software, and cultural preservation technology.",
        location: "San Francisco, CA",
        website: "https://digitalsolutionstamil.com",
        phone: "+1-415-555-TECH",
        email: "hello@digitalsolutionstamil.com",
        services: ["Web Development", "Mobile Apps", "Tamil Language Software", "E-learning Platforms", "Cultural Apps"],
        yearEstablished: 2020,
        employeeCount: "5-10",
        rating: 5,
        reviewsCount: 23,
        isVerified: true,
        isFeatured: false,
        socialMedia: {
          linkedin: "digital-solutions-tamil",
          github: "digitalsolutionstamil"
        },
      },
      {
        ownerId: "sample-user-3",
        businessName: "Tamil Health Consultancy",
        businessLogo: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop",
        category: "Healthcare",
        description: "Healthcare consultancy specializing in community health programs, medical interpretation services, and health education for Tamil diaspora.",
        location: "London, UK",
        website: "https://tamilhealthconsultancy.co.uk",
        phone: "+44-20-555-HEALTH",
        email: "info@tamilhealthconsultancy.co.uk",
        services: ["Health Consultancy", "Medical Interpretation", "Community Health Programs", "Health Education", "Elderly Care Coordination"],
        yearEstablished: 2019,
        employeeCount: "10-25",
        rating: 4,
        reviewsCount: 67,
        isVerified: true,
        isFeatured: true,
        socialMedia: {
          linkedin: "tamil-health-consultancy",
          facebook: "TamilHealthUK"
        },
      }
    ];

    // Create sample businesses
    for (const business of sampleBusinesses) {
      await storage.createBusiness(business);
    }

    // Sample announcements
    const sampleAnnouncements = [
      {
        authorId: "sample-user-5",
        title: "Welcome to Digital House Community Platform!",
        content: "வணக்கம் (Vanakkam) everyone! Welcome to our new Digital House community platform. This is your space to connect with Tamil diaspora members worldwide, share experiences, seek help, and build meaningful relationships. Please take a moment to complete your profile and explore the various features available.",
        priority: "high" as const,
        isActive: true,
        isPinned: true,
        expiresAt: null,
      },
      {
        authorId: "sample-user-5",
        title: "Community Guidelines and Code of Conduct",
        content: "To maintain a respectful and inclusive environment for all members, please familiarize yourself with our community guidelines:\n\n1. Treat all members with respect and kindness\n2. No hate speech, discrimination, or harassment\n3. Share authentic information and avoid spam\n4. Help others when possible and seek help when needed\n5. Celebrate our Tamil culture while being inclusive\n\nViolations may result in account suspension. Let's build a supportive community together!",
        priority: "medium" as const,
        isActive: true,
        isPinned: true,
        expiresAt: null,
      },
      {
        authorId: "sample-user-5",
        title: "Upcoming Tamil New Year Celebrations 2024",
        content: "Get ready to celebrate Tamil New Year (Puthandu) on April 14th! We're organizing virtual and in-person celebrations across multiple cities:\n\n🌟 San Francisco: Cultural program at Tamil Association\n🌟 Toronto: Community feast and performances\n🌟 London: Online celebration with cultural activities\n🌟 Sydney: Beach gathering and traditional games\n\nRegister through the Events section. Let's make this year's celebration memorable!",
        priority: "medium" as const,
        isActive: true,
        isPinned: false,
        expiresAt: new Date("2024-04-20T00:00:00Z"),
      },
      {
        authorId: "sample-user-5",
        title: "Version 2.0 Features Now Available!",
        content: "Exciting news! Version 2.0 of Digital House is now live with enhanced features:\n\n✨ AI-Powered Matrimony Matching\n✨ Comprehensive Jobs Portal\n✨ Business Networking Hub\n\nSwitch to Version 2.0 from your profile menu to access these new features. Current Version 1.0 users can continue using the classic experience or upgrade anytime.",
        priority: "high" as const,
        isActive: true,
        isPinned: false,
        expiresAt: new Date("2024-03-31T00:00:00Z"),
      },
      {
        authorId: "sample-user-5",
        title: "Emergency Contact Network Activated",
        content: "Due to recent global events, we've activated our emergency contact network. Community members in affected areas, please check in and let us know you're safe. Others can offer assistance through the Help Desk.\n\nEmergency coordinators:\n- North America: Priya (+1-555-HELP)\n- Europe: Dr. Meera (+44-EMERGENCY)\n- Asia-Pacific: Contact local representatives\n\nStay safe, everyone!",
        priority: "urgent" as const,
        isActive: true,
        isPinned: false,
        expiresAt: new Date("2024-02-28T00:00:00Z"),
      }
    ];

    // Create sample announcements
    for (const announcement of sampleAnnouncements) {
      await storage.createAnnouncement(announcement);
    }

    console.log("✅ Sample data created successfully!");
    console.log("Created:");
    console.log(`- ${sampleUsers.length} users`);
    console.log(`- ${samplePosts.length} posts`);
    console.log(`- ${sampleEvents.length} events`);
    console.log(`- ${sampleHelpRequests.length} help requests`);
    console.log(`- ${sampleMatrimonyProfiles.length} matrimony profiles`);
    console.log(`- ${sampleJobs.length} jobs`);
    console.log(`- ${sampleBusinesses.length} businesses`);
    console.log(`- ${sampleAnnouncements.length} announcements`);

  } catch (error) {
    console.error("Error creating sample data:", error);
    throw error;
  }
}
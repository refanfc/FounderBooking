import { 
  users, creators, timeSlots, bookings,
  type User, type Creator, type TimeSlot, type Booking,
  type InsertUser, type InsertCreator, type InsertTimeSlot, type InsertBooking,
  type CreatorWithUser, type BookingWithDetails
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFid(fid: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserWallet(id: number, walletAddress: string): Promise<User>;

  // Creators
  getCreator(id: number): Promise<Creator | undefined>;
  getCreatorByUserId(userId: number): Promise<Creator | undefined>;
  getCreators(category?: string): Promise<CreatorWithUser[]>;
  createCreator(creator: InsertCreator): Promise<Creator>;
  updateCreator(id: number, updates: Partial<Creator>): Promise<Creator>;

  // Time Slots
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  getAvailableTimeSlots(creatorId: number, startDate?: Date, endDate?: Date): Promise<TimeSlot[]>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  updateTimeSlotAvailability(id: number, isAvailable: boolean): Promise<TimeSlot>;

  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getUserBookings(userId: number): Promise<BookingWithDetails[]>;
  getCreatorBookings(creatorId: number): Promise<BookingWithDetails[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private creators: Map<number, Creator>;
  private timeSlots: Map<number, TimeSlot>;
  private bookings: Map<number, Booking>;
  private currentUserId: number;
  private currentCreatorId: number;
  private currentTimeSlotId: number;
  private currentBookingId: number;

  constructor() {
    this.users = new Map();
    this.creators = new Map();
    this.timeSlots = new Map();
    this.bookings = new Map();
    this.currentUserId = 1;
    this.currentCreatorId = 1;
    this.currentTimeSlotId = 1;
    this.currentBookingId = 1;

    // Seed with some initial data
    this.seedInitialData();
  }

  private async seedInitialData() {
    // Create some sample users and creators
    const user1 = await this.createUser({
      username: "dwr.eth",
      fid: 3,
      profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      displayName: "Dan Romero",
      bio: "Co-founder of Farcaster. Product strategy, protocol design, and building consumer crypto products.",
    });

    const user2 = await this.createUser({
      username: "sarahc.eth",
      fid: 1234,
      profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      displayName: "Sarah Chen",
      bio: "Founder of CryptoUX. Product design and UX for web3 applications.",
    });

    const user3 = await this.createUser({
      username: "alexdev.eth",
      fid: 5678,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      displayName: "Alex Thompson",
      bio: "Senior Engineer at Base. Smart contract development and DeFi protocols.",
    });

    // Create creator profiles
    const creator1 = await this.createCreator({
      userId: user1.id,
      title: "Co-founder, Farcaster",
      rate: 20000, // $200.00
      duration: 30,
      category: "founders",
      timezone: "America/Los_Angeles",
    });

    const creator2 = await this.createCreator({
      userId: user2.id,
      title: "Founder, CryptoUX",
      rate: 15000, // $150.00
      duration: 45,
      category: "designers",
      timezone: "America/New_York",
    });

    const creator3 = await this.createCreator({
      userId: user3.id,
      title: "Senior Engineer, Base",
      rate: 18000, // $180.00
      duration: 60,
      category: "developers",
      timezone: "America/New_York",
    });

    // Create some available time slots for the next few days
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Creator 1 slots
    await this.createTimeSlot({
      creatorId: creator1.id,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 9, 30),
    });

    await this.createTimeSlot({
      creatorId: creator1.id,
      startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
      endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 30),
    });

    // Creator 2 slots
    await this.createTimeSlot({
      creatorId: creator2.id,
      startTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 10, 0),
      endTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 10, 45),
    });

    await this.createTimeSlot({
      creatorId: creator2.id,
      startTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 15, 0),
      endTime: new Date(dayAfter.getFullYear(), dayAfter.getMonth(), dayAfter.getDate(), 15, 45),
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFid(fid: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.fid === fid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      fid: insertUser.fid || null,
      profileImage: insertUser.profileImage || null,
      displayName: insertUser.displayName || null,
      bio: insertUser.bio || null,
      walletAddress: insertUser.walletAddress || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserWallet(id: number, walletAddress: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated: User = { ...user, walletAddress };
    this.users.set(id, updated);
    return updated;
  }

  async getCreator(id: number): Promise<Creator | undefined> {
    return this.creators.get(id);
  }

  async getCreatorByUserId(userId: number): Promise<Creator | undefined> {
    return Array.from(this.creators.values()).find(creator => creator.userId === userId);
  }

  async getCreators(category?: string): Promise<CreatorWithUser[]> {
    const allCreators = Array.from(this.creators.values());
    const filtered = category 
      ? allCreators.filter(creator => creator.category === category && creator.isActive)
      : allCreators.filter(creator => creator.isActive);

    return filtered.map(creator => {
      const user = this.users.get(creator.userId)!;
      return { ...creator, user };
    });
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const id = this.currentCreatorId++;
    const creator: Creator = { ...insertCreator, id };
    this.creators.set(id, creator);
    return creator;
  }

  async updateCreator(id: number, updates: Partial<Creator>): Promise<Creator> {
    const creator = this.creators.get(id);
    if (!creator) throw new Error("Creator not found");
    const updated: Creator = { ...creator, ...updates };
    this.creators.set(id, updated);
    return updated;
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }

  async getAvailableTimeSlots(creatorId: number, startDate?: Date, endDate?: Date): Promise<TimeSlot[]> {
    const slots = Array.from(this.timeSlots.values()).filter(slot => 
      slot.creatorId === creatorId && slot.isAvailable
    );

    if (startDate && endDate) {
      return slots.filter(slot => 
        slot.startTime >= startDate && slot.endTime <= endDate
      );
    }

    return slots;
  }

  async createTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const id = this.currentTimeSlotId++;
    const timeSlot: TimeSlot = { ...insertTimeSlot, id };
    this.timeSlots.set(id, timeSlot);
    return timeSlot;
  }

  async updateTimeSlotAvailability(id: number, isAvailable: boolean): Promise<TimeSlot> {
    const timeSlot = this.timeSlots.get(id);
    if (!timeSlot) throw new Error("Time slot not found");
    const updated: TimeSlot = { ...timeSlot, isAvailable };
    this.timeSlots.set(id, updated);
    return updated;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getUserBookings(userId: number): Promise<BookingWithDetails[]> {
    const userBookings = Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
    
    return userBookings.map(booking => {
      const creator = this.creators.get(booking.creatorId)!;
      const user = this.users.get(creator.userId)!;
      const timeSlot = this.timeSlots.get(booking.timeSlotId)!;
      
      return {
        ...booking,
        creator: { ...creator, user },
        timeSlot
      };
    });
  }

  async getCreatorBookings(creatorId: number): Promise<BookingWithDetails[]> {
    const creatorBookings = Array.from(this.bookings.values()).filter(booking => booking.creatorId === creatorId);
    
    return creatorBookings.map(booking => {
      const creator = this.creators.get(booking.creatorId)!;
      const user = this.users.get(creator.userId)!;
      const timeSlot = this.timeSlots.get(booking.timeSlotId)!;
      
      return {
        ...booking,
        creator: { ...creator, user },
        timeSlot
      };
    });
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) throw new Error("Booking not found");
    const updated: Booking = { 
      ...booking, 
      status,
      ...(paymentIntentId && { paymentIntentId })
    };
    this.bookings.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();

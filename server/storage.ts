import { 
  users, creators, timeSlots, bookings,
  type User, type Creator, type TimeSlot, type Booking,
  type InsertUser, type InsertCreator, type InsertTimeSlot, type InsertBooking,
  type CreatorWithUser, type BookingWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  constructor() {
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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFid(fid: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.fid, fid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserWallet(id: number, walletAddress: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ walletAddress })
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async getCreator(id: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator || undefined;
  }

  async getCreatorByUserId(userId: number): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.userId, userId));
    return creator || undefined;
  }

  async getCreators(category?: string): Promise<CreatorWithUser[]> {
    let whereConditions = [eq(creators.isActive, true)];
    
    if (category) {
      whereConditions.push(eq(creators.category, category));
    }

    const results = await db
      .select()
      .from(creators)
      .innerJoin(users, eq(creators.userId, users.id))
      .where(and(...whereConditions));
    
    return results.map(({ creators: creator, users: user }) => ({
      ...creator,
      user
    }));
  }

  async createCreator(insertCreator: InsertCreator): Promise<Creator> {
    const [creator] = await db
      .insert(creators)
      .values(insertCreator)
      .returning();
    return creator;
  }

  async updateCreator(id: number, updates: Partial<Creator>): Promise<Creator> {
    const [creator] = await db
      .update(creators)
      .set(updates)
      .where(eq(creators.id, id))
      .returning();
    if (!creator) throw new Error("Creator not found");
    return creator;
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    const [timeSlot] = await db.select().from(timeSlots).where(eq(timeSlots.id, id));
    return timeSlot || undefined;
  }

  async getAvailableTimeSlots(creatorId: number, startDate?: Date, endDate?: Date): Promise<TimeSlot[]> {
    let whereConditions = [
      eq(timeSlots.creatorId, creatorId),
      eq(timeSlots.isAvailable, true)
    ];

    if (startDate && endDate) {
      whereConditions.push(gte(timeSlots.startTime, startDate));
      whereConditions.push(lte(timeSlots.endTime, endDate));
    }

    return await db
      .select()
      .from(timeSlots)
      .where(and(...whereConditions));
  }

  async createTimeSlot(insertTimeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [timeSlot] = await db
      .insert(timeSlots)
      .values(insertTimeSlot)
      .returning();
    return timeSlot;
  }

  async updateTimeSlotAvailability(id: number, isAvailable: boolean): Promise<TimeSlot> {
    const [timeSlot] = await db
      .update(timeSlots)
      .set({ isAvailable })
      .where(eq(timeSlots.id, id))
      .returning();
    if (!timeSlot) throw new Error("Time slot not found");
    return timeSlot;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getUserBookings(userId: number): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(creators, eq(bookings.creatorId, creators.id))
      .innerJoin(users, eq(creators.userId, users.id))
      .innerJoin(timeSlots, eq(bookings.timeSlotId, timeSlots.id))
      .where(eq(bookings.userId, userId));

    return results.map(({ bookings: booking, creators: creator, users: user, time_slots: timeSlot }) => ({
      ...booking,
      creator: { ...creator, user },
      timeSlot
    }));
  }

  async getCreatorBookings(creatorId: number): Promise<BookingWithDetails[]> {
    const results = await db
      .select()
      .from(bookings)
      .innerJoin(creators, eq(bookings.creatorId, creators.id))
      .innerJoin(users, eq(creators.userId, users.id))
      .innerJoin(timeSlots, eq(bookings.timeSlotId, timeSlots.id))
      .where(eq(bookings.creatorId, creatorId));

    return results.map(({ bookings: booking, creators: creator, users: user, time_slots: timeSlot }) => ({
      ...booking,
      creator: { ...creator, user },
      timeSlot
    }));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values({
        ...insertBooking,
        status: insertBooking.status || "pending",
        message: insertBooking.message || null,
        paymentIntentId: insertBooking.paymentIntentId || null
      })
      .returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string, paymentIntentId?: string): Promise<Booking> {
    const updateData: any = { status };
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    
    if (!booking) throw new Error("Booking not found");
    return booking;
  }
}

export const storage = new DatabaseStorage();

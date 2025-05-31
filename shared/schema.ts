import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  fid: integer("fid").unique(), // Farcaster ID
  profileImage: text("profile_image"),
  displayName: text("display_name"),
  bio: text("bio"),
  walletAddress: text("wallet_address"),
});

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  rate: integer("rate").notNull(), // Price in cents
  duration: integer("duration").notNull(), // Duration in minutes
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
  timezone: text("timezone").default("UTC"),
});

export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  creatorId: integer("creator_id").notNull(),
  timeSlotId: integer("time_slot_id").notNull(),
  message: text("message"),
  totalAmount: integer("total_amount").notNull(), // Price in cents
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCreatorSchema = createInsertSchema(creators).omit({ id: true });
export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({ id: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type Creator = typeof creators.$inferSelect;
export type TimeSlot = typeof timeSlots.$inferSelect;
export type Booking = typeof bookings.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Extended types for API responses
export type CreatorWithUser = Creator & {
  user: User;
};

export type BookingWithDetails = Booking & {
  creator: CreatorWithUser;
  timeSlot: TimeSlot;
};

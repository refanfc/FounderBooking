import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertBookingSchema } from "@shared/schema";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all creators
  app.get("/api/creators", async (req, res) => {
    try {
      const { category } = req.query;
      const creators = await storage.getCreators(category as string);
      res.json(creators);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get creator by ID
  app.get("/api/creators/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const creator = await storage.getCreator(id);
      if (!creator) {
        return res.status(404).json({ message: "Creator not found" });
      }
      
      const user = await storage.getUser(creator.userId);
      res.json({ ...creator, user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get available time slots for a creator
  app.get("/api/creators/:id/timeslots", async (req, res) => {
    try {
      const creatorId = parseInt(req.params.id);
      const { startDate, endDate } = req.query;
      
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const timeSlots = await storage.getAvailableTimeSlots(creatorId, start, end);
      res.json(timeSlots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create a booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Verify time slot is available
      const timeSlot = await storage.getTimeSlot(bookingData.timeSlotId);
      if (!timeSlot || !timeSlot.isAvailable) {
        return res.status(400).json({ message: "Time slot is not available" });
      }

      // Create the booking
      const booking = await storage.createBooking(bookingData);
      
      // Mark time slot as unavailable
      await storage.updateTimeSlotAvailability(bookingData.timeSlotId, false);
      
      res.json(booking);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user bookings
  app.get("/api/bookings/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment intent for booking
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount already in cents
        currency: "usd",
        metadata: {
          bookingId: bookingId?.toString() || ""
        }
      });

      // Update booking with payment intent ID
      if (bookingId) {
        await storage.updateBookingStatus(
          bookingId, 
          "payment_pending", 
          paymentIntent.id
        );
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  // Confirm payment and finalize booking
  app.post("/api/confirm-payment", async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === "succeeded") {
        const bookingId = parseInt(paymentIntent.metadata.bookingId);
        if (bookingId) {
          await storage.updateBookingStatus(bookingId, "confirmed");
        }
        res.json({ success: true, status: "confirmed" });
      } else {
        res.json({ success: false, status: paymentIntent.status });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create or get user (for Farcaster integration)
  app.post("/api/users", async (req, res) => {
    try {
      const { fid, username, profileImage, displayName, bio } = req.body;
      
      // Check if user already exists
      let user = await storage.getUserByFid(fid);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username,
          fid,
          profileImage,
          displayName,
          bio
        });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update user wallet address
  app.patch("/api/users/:id/wallet", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { walletAddress } = req.body;
      
      const user = await storage.updateUserWallet(userId, walletAddress);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create creator profile
  app.post("/api/creators", async (req, res) => {
    try {
      const { userId, title, rate, duration, category, timezone } = req.body;
      
      // Check if creator profile already exists for this user
      const existingCreator = await storage.getCreatorByUserId(userId);
      if (existingCreator) {
        return res.status(400).json({ message: "Creator profile already exists for this user" });
      }
      
      const creator = await storage.createCreator({
        userId,
        title,
        rate: Math.round(rate * 100), // Convert to cents
        duration,
        category,
        timezone
      });
      
      res.json(creator);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

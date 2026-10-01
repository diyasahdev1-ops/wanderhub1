import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { generateItineraryWithGemini, chatWithGeminiScout, generatePackingChecklist, getCountryMapPlacesWithAI } from './gemini.js';

export const apiRouter = Router();

// Middleware for demo session auth (token/header or cookie fallback)
function getUserIdFromRequest(req: Request): string {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  const customUser = req.headers['x-user-id'];
  if (typeof customUser === 'string' && customUser) {
    return customUser;
  }
  return 'usr-demo-wanderer';
}

// ----------------- AUTH ENDPOINTS -----------------
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    const user = db.createUser({
      email,
      passwordHash: password,
      name,
    });
    return res.json({
      token: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        homeCountry: user.homeCountry,
        travelStyle: user.travelStyle,
        bucketList: user.bucketList
      }
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Registration failed' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required.' });
    }
    const user = db.findUserByEmail(email);
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    return res.json({
      token: user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        homeCountry: user.homeCountry,
        travelStyle: user.travelStyle,
        bucketList: user.bucketList
      }
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Login failed' });
  }
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      homeCountry: user.homeCountry,
      travelStyle: user.travelStyle,
      bucketList: user.bucketList
    }
  });
});

apiRouter.put('/auth/profile', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const updates = req.body;
  const updated = db.updateUser(userId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user: updated });
});

// ----------------- DESTINATIONS -----------------
apiRouter.get('/destinations', (_req: Request, res: Response) => {
  const destinations = db.getDestinations();
  return res.json(destinations);
});

apiRouter.get('/destinations/:id', (req: Request, res: Response) => {
  const dest = db.getDestinationById(req.params.id);
  if (!dest) {
    return res.status(404).json({ error: 'Destination not found' });
  }
  return res.json(dest);
});

// ----------------- BOOKINGS & TICKETS -----------------
apiRouter.get('/bookings', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const bookings = db.getBookings(userId);
  return res.json(bookings);
});

apiRouter.get('/bookings/offers', (_req: Request, res: Response) => {
  const offers = db.getBookableOffers();
  return res.json(offers);
});

apiRouter.post('/bookings', (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromRequest(req);
    const user = db.findUserById(userId);
    const {
      type,
      title,
      destination,
      country,
      origin,
      date,
      time,
      passengerName,
      passengerEmail,
      ticketClass,
      seatOrQuantity,
      priceUSD,
      gateOrPlatform,
      notes
    } = req.body;

    if (!title || !destination) {
      return res.status(400).json({ error: 'Title and destination are required' });
    }

    const booking = db.createBooking({
      userId,
      type: type || 'train',
      title,
      destination,
      country: country || 'Worldwide',
      origin: origin || '',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '10:00 AM',
      passengerName: passengerName || (user ? user.name : 'Valued Traveler'),
      passengerEmail: passengerEmail || (user ? user.email : 'traveler@wanderhub.com'),
      ticketClass: ticketClass || 'Standard',
      seatOrQuantity: seatOrQuantity || 'Seat 14A',
      priceUSD: Number(priceUSD) || 25,
      gateOrPlatform: gateOrPlatform || 'Platform 1',
      qrCodeSeed: `WH-${destination.substring(0, 3).toUpperCase()}-${Date.now()}`,
      notes: notes || 'Show digital ticket at boarding checkpoint.'
    });

    return res.status(201).json(booking);
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Booking failed' });
  }
});

apiRouter.delete('/bookings/:id', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const success = db.cancelBooking(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Booking not found or already cancelled' });
  }
  return res.json({ success: true, message: 'Ticket booking cancelled successfully' });
});

// ----------------- GEMINI AI ENDPOINTS -----------------
apiRouter.post('/gemini/generate-itinerary', async (req: Request, res: Response) => {
  try {
    const { destination, country, durationDays, style, budgetTier, companions, interests } = req.body;
    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }
    const result = await generateItineraryWithGemini({
      destination,
      country,
      durationDays: Math.min(Math.max(Number(durationDays) || 3, 1), 14),
      style: style || 'Culture',
      budgetTier: budgetTier || 'Moderate',
      companions: companions || 'Solo',
      interests: Array.isArray(interests) ? interests : []
    });
    return res.json(result);
  } catch (err: unknown) {
    console.error('API generate-itinerary error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'AI Generation failed' });
  }
});

apiRouter.post('/gemini/scout-chat', async (req: Request, res: Response) => {
  try {
    const { messages, destinationContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }
    const reply = await chatWithGeminiScout(messages, destinationContext);
    return res.json({ reply });
  } catch (err: unknown) {
    console.error('API scout-chat error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'AI Chat failed' });
  }
});

apiRouter.post('/gemini/packing', async (req: Request, res: Response) => {
  try {
    const { destination, durationDays, style } = req.body;
    const items = await generatePackingChecklist(
      destination || 'Global',
      Number(durationDays) || 5,
      style || 'Adventure'
    );
    return res.json({ items });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Packing list generation failed' });
  }
});

apiRouter.post('/gemini/country-map', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query country or city is required' });
    }
    const result = await getCountryMapPlacesWithAI(query);
    return res.json(result);
  } catch (err: unknown) {
    console.error('API country-map error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to retrieve country map data' });
  }
});


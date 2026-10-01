import { Destination, Trip, User, GeneratedItinerary, PackingItem, TicketBooking, BookableOffer, CountryMapResponse } from '../types';

// Support Vercel production/preview backend URL, or fallback to relative URL for same-origin serverless
const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('wanderhub_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-user-id'] = token;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Destinations
  async getDestinations(): Promise<Destination[]> {
    const res = await fetch(`${API_BASE_URL}/api/destinations`);
    if (!res.ok) throw new Error('Failed to fetch destinations');
    return res.json();
  },

  async getDestination(id: string): Promise<Destination> {
    const res = await fetch(`${API_BASE_URL}/api/destinations/${id}`);
    if (!res.ok) throw new Error('Destination not found');
    return res.json();
  },

  // Trips (Legacy / Itinerary saving)
  async getTrips(): Promise<Trip[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trips`, { headers: getAuthHeaders() });
      if (res.ok) return await res.json();
    } catch {
      // Fallback to local storage
    }
    const saved = localStorage.getItem('wanderhub_saved_trips');
    return saved ? JSON.parse(saved) : [];
  },

  async createTrip(tripData: Partial<Trip>): Promise<Trip> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(tripData),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const newTrip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      userId: 'usr-demo-wanderer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Trip;
    const existing = await this.getTrips();
    localStorage.setItem('wanderhub_saved_trips', JSON.stringify([newTrip, ...existing]));
    return newTrip;
  },

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip> {
    const existing = await this.getTrips();
    const updated = existing.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t);
    localStorage.setItem('wanderhub_saved_trips', JSON.stringify(updated));
    return updated.find(t => t.id === id)!;
  },

  async deleteTrip(id: string): Promise<boolean> {
    const existing = await this.getTrips();
    const filtered = existing.filter(t => t.id !== id);
    localStorage.setItem('wanderhub_saved_trips', JSON.stringify(filtered));
    return true;
  },

  // Bookings & Tickets
  async getBookings(): Promise<TicketBooking[]> {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },

  async getBookableOffers(): Promise<BookableOffer[]> {
    const res = await fetch(`${API_BASE_URL}/api/bookings/offers`);
    if (!res.ok) throw new Error('Failed to fetch bookable offers');
    return res.json();
  },

  async createBooking(bookingData: Partial<TicketBooking>): Promise<TicketBooking> {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to complete booking');
    }
    return res.json();
  },

  async cancelBooking(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
  },

  // Gemini AI
  async generateItinerary(params: {
    destination: string;
    country?: string;
    durationDays: number;
    style: string;
    budgetTier: string;
    companions: string;
    interests?: string[];
  }): Promise<GeneratedItinerary> {
    const res = await fetch(`${API_BASE_URL}/api/gemini/generate-itinerary`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to generate itinerary with AI');
    }
    return res.json();
  },

  async chatWithScout(messages: { role: 'user' | 'assistant'; content: string }[], destinationContext?: string): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/api/gemini/scout-chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ messages, destinationContext }),
    });
    if (!res.ok) throw new Error('Chat failed');
    const data = await res.json();
    return data.reply;
  },

  async generatePacking(destination: string, durationDays: number, style: string): Promise<PackingItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/gemini/packing`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ destination, durationDays, style }),
    });
    if (!res.ok) throw new Error('Packing generation failed');
    const data = await res.json();
    return (data.items || []).map((item: { item: string; category: string }, idx: number) => ({
      id: `gen-pack-${idx}`,
      item: item.item,
      packed: false,
      category: (item.category || 'essentials') as PackingItem['category'],
    }));
  },

  async getCountryMapPlaces(query: string): Promise<CountryMapResponse> {
    const res = await fetch(`${API_BASE_URL}/api/gemini/country-map`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to retrieve country map data');
    return res.json();
  },
};

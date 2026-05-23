/* ============================================
   Event Service
   Mock CRUD operations with localStorage
   ============================================ */

import { mockEvents } from '../data/mockEvents';

const STORAGE_KEY = 'cc_events';

/* ===== Internal Helpers ===== */

const getEventsFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fall through */
  }

  /* Initialize from mock data */
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockEvents));
  return [...mockEvents];
};

const saveEventsToStorage = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ===== Exported Functions ===== */

/**
 * Get events with optional filter
 * @param {string} [filter] - 'students-only' | 'externals-allowed' | null for all
 * @returns {Promise<array>} Filtered and sorted events
 */
export const getEvents = async (filter) => {
  await delay(300);

  let events = getEventsFromStorage();

  if (filter === 'students-only') {
    events = events.filter((e) => e.tag === 'students-only');
  } else if (filter === 'externals-allowed') {
    events = events.filter((e) => e.tag === 'externals-allowed');
  }

  /* Sort by date descending (newest first) */
  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  return events;
};

/**
 * Get a single event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<object|null>} The event or null
 */
export const getEvent = async (eventId) => {
  await delay(200);

  const events = getEventsFromStorage();
  return events.find((e) => e.id === eventId) || null;
};

/**
 * Create a new event
 * @param {object} data - Event data
 * @returns {Promise<object>} The created event
 */
export const createEvent = async (data) => {
  await delay(400);

  const newEvent = {
    id: 'event-' + Date.now(),
    attendees: [],
    createdAt: new Date().toISOString(),
    ...data,
  };

  const events = getEventsFromStorage();
  events.unshift(newEvent);
  saveEventsToStorage(events);

  return newEvent;
};

/**
 * Update an existing event
 * @param {string} eventId - Event ID
 * @param {object} data - Fields to update
 * @returns {Promise<object|null>} The updated event or null
 */
export const updateEvent = async (eventId, data) => {
  await delay(300);

  const events = getEventsFromStorage();
  const index = events.findIndex((e) => e.id === eventId);

  if (index === -1) return null;

  events[index] = { ...events[index], ...data };
  saveEventsToStorage(events);

  return events[index];
};

/**
 * Delete an event
 * @param {string} eventId - Event ID
 * @returns {Promise<boolean>} Whether the event was deleted
 */
export const deleteEvent = async (eventId) => {
  await delay(300);

  const events = getEventsFromStorage();
  const filtered = events.filter((e) => e.id !== eventId);
  saveEventsToStorage(filtered);

  return true;
};

/**
 * Toggle RSVP for a user on an event
 * @param {string} eventId - Event ID
 * @param {string} userId - User ID
 * @returns {Promise<object>} { event, isAttending }
 */
export const rsvpEvent = async (eventId, userId) => {
  await delay(200);

  const events = getEventsFromStorage();
  const index = events.findIndex((e) => e.id === eventId);

  if (index === -1) return { event: null, isAttending: false };

  const event = events[index];
  const attendeeIndex = event.attendees.indexOf(userId);
  let isAttending;

  if (attendeeIndex > -1) {
    /* Remove RSVP */
    event.attendees.splice(attendeeIndex, 1);
    isAttending = false;
  } else {
    /* Add RSVP */
    event.attendees.push(userId);
    isAttending = true;
  }

  events[index] = event;
  saveEventsToStorage(events);

  return { event, isAttending };
};

/**
 * Get attendees for an event
 * @param {string} eventId - Event ID
 * @returns {Promise<array>} Array of attendee user IDs
 */
export const getEventAttendees = async (eventId) => {
  await delay(200);

  const events = getEventsFromStorage();
  const event = events.find((e) => e.id === eventId);

  return event ? event.attendees : [];
};

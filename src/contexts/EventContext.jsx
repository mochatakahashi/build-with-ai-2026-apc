import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as eventService from '../services/eventService';
import { useToast } from './ToastContext';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { showToast } = useToast();

  const fetchEvents = useCallback(async (filter = 'all', userId = null) => {
    setLoading(true);
    try {
      // Handle 'my-events' separately, which requires fetching all events and filtering locally
      const reqFilter = filter === 'my-events' || filter === 'all' ? null : filter;
      let fetched = await eventService.getEvents(reqFilter);
      
      if (filter === 'my-events' && userId) {
        fetched = fetched.filter((e) => e.organizerId === userId || e.attendees?.includes(userId));
      }
      setEvents(fetched);
    } catch (error) {
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const setFilter = useCallback((filter) => {
    setActiveFilter(filter);
  }, []);

  const createEvent = async (eventData) => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      setEvents((prev) => [newEvent, ...prev]);
      showToast('Event created successfully!', 'success');
      return newEvent;
    } catch (error) {
      showToast('Failed to create event', 'error');
      throw error;
    }
  };

  const updateEvent = async (eventId, eventData) => {
    try {
      const updated = await eventService.updateEvent(eventId, eventData);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      showToast('Event updated successfully!', 'success');
      return updated;
    } catch (error) {
      showToast('Failed to update event', 'error');
      throw error;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await eventService.deleteEvent(eventId);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      showToast('Event deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete event', 'error');
      throw error;
    }
  };

  const rsvpEvent = async (eventId, userId) => {
    try {
      const { event: updatedEvent, isAttending } = await eventService.rsvpEvent(eventId, userId);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updatedEvent : e)));
      showToast(isAttending ? 'RSVP successful!' : 'RSVP cancelled', 'success');
      return { updatedEvent, isAttending };
    } catch (error) {
      showToast('Failed to update RSVP', 'error');
      throw error;
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        activeFilter,
        setFilter,
        fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent,
        rsvpEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}

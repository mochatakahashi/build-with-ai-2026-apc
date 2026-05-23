import React, { useState, useEffect } from 'react';
import { Calendar, Shield, Globe, User, Plus, Search, MapPin, Tag } from 'lucide-react';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import SearchBar from '../components/SearchBar';
import './EventsPage.css';

export default function EventsPage() {
  const { events, loading, activeFilter, setFilter, fetchEvents, createEvent, rsvpEvent } = useEvents();
  const { user: currentUser } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Create Event Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    tag: 'students-only',
    coverImageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents(activeFilter, currentUser?.id);
  }, [activeFilter, fetchEvents, currentUser]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location) return;

    setSubmitting(true);
    try {
      // Create random placeholder cover if none provided
      const randSeed = Math.floor(Math.random() * 1000);
      const coverUrl = form.coverImageUrl || `https://picsum.photos/seed/${randSeed}/800/400`;

      await createEvent({
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        location: form.location,
        tag: form.tag,
        coverImageUrl: coverUrl,
        organizerId: currentUser.id,
        organizerName: currentUser.displayName,
      });

      // Reset form & close modal
      setForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        tag: 'students-only',
        coverImageUrl: '',
      });
      setCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRSVPToggle = async (eventId) => {
    if (!currentUser) return;
    await rsvpEvent(eventId, currentUser.id);
  };

  // Filter events based on search query
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filters = [
    { key: 'all', label: 'All Events', icon: Calendar },
    { key: 'students-only', label: 'Students Only', icon: Shield },
    { key: 'externals-allowed', label: 'Externals Allowed', icon: Globe },
    { key: 'my-events', label: 'My Events', icon: User },
  ];

  return (
    <div className="events-page container">
      {/* Header section */}
      <div className="events-page__header flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="events-page__title text-gradient">Campus Events</h1>
          <p className="events-page__subtitle">Discover what's happening on campus</p>
        </div>
        <button className="btn btn--primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} />
          Create Event
        </button>
      </div>

      {/* Search & Filter section */}
      <div className="events-page__controls flex flex-col gap-md mb-lg">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search events by title, location or organizer..."
        />

        <div className="events-page__tabs">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.key}
                className={`events-page__tab ${activeFilter === filter.key ? 'events-page__tab--active' : ''}`}
                onClick={() => setFilter(filter.key)}
              >
                <Icon size={14} />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Events */}
      {loading ? (
        <div className="events-page__loading">
          <div className="loading-spinner" />
          <p className="loading-text">Loading campus events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state glass-card">
          <Calendar className="empty-state__icon" />
          <h3 className="empty-state__title">No Events Found</h3>
          <p className="empty-state__text">
            {searchQuery
              ? 'No events match your search criteria. Try different keywords.'
              : 'No events listed in this category yet. Be the first to host one!'}
          </p>
          {!searchQuery && (
            <button className="btn btn--primary mt-md" onClick={() => setCreateModalOpen(true)}>
              Host Event
            </button>
          )}
        </div>
      ) : (
        <div className="events-page__grid grid grid--3 grid--auto-fill">
          {filteredEvents.map((event) => (
            <div key={event.id} className="events-page__grid-item">
              <EventCard
                event={event}
                onRSVP={handleRSVPToggle}
                currentUserId={currentUser?.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Host Campus Event" size="md">
        <form onSubmit={handleCreateSubmit} className="create-event-form">
          <div className="form-group">
            <label className="form-label" htmlFor="title">Event Title</label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="Hackathon 2026, Sports Tournament, etc."
              value={form.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group mt-md">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-input form-textarea"
              placeholder="What is this event about? Highlights, guest speakers, rewards..."
              value={form.description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div className="register-form__grid mt-md">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="form-input"
                value={form.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="time">Time</label>
              <input
                id="time"
                type="time"
                className="form-input"
                value={form.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group mt-md">
            <label className="form-label" htmlFor="location">Location</label>
            <div className="form-input-wrapper">
              <MapPin className="form-input-icon" size={16} />
              <input
                id="location"
                type="text"
                className="form-input form-input--has-icon"
                placeholder="APC Gym, CS Laboratory, Online via Teams"
                value={form.location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="register-form__grid mt-md">
            <div className="form-group">
              <label className="form-label" htmlFor="tag">Audience Tag</label>
              <div className="form-input-wrapper">
                <Tag className="form-input-icon" size={16} />
                <select
                  id="tag"
                  className="form-input form-input--has-icon"
                  value={form.tag}
                  onChange={handleInputChange}
                >
                  <option value="students-only">Students Only</option>
                  <option value="externals-allowed">Externals Allowed</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="coverImageUrl">Cover Image URL (Optional)</label>
              <input
                id="coverImageUrl"
                type="url"
                className="form-input"
                placeholder="https://example.com/cover.jpg"
                value={form.coverImageUrl}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="create-event-actions mt-lg flex justify-end gap-sm">
            <button type="button" className="btn btn--secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

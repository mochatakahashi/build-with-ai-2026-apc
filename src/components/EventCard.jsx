import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Shield, Globe } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import './EventCard.css';

export default function EventCard({ event, onRSVP, currentUserId }) {
  const { id, title, date, time, location, coverImageUrl, tag, attendees = [] } = event;
  const isAttending = currentUserId && attendees.includes(currentUserId);

  const getTagBadge = () => {
    if (tag === 'students-only') {
      return (
        <span className="badge badge--primary event-card__tag">
          <Shield size={10} />
          Students Only
        </span>
      );
    }
    return (
      <span className="badge badge--success event-card__tag">
        <Globe size={10} />
        Externals Allowed
      </span>
    );
  };

  const formattedDate = () => {
    if (!date) return '';
    const d = new Date(date);
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return `${dayStr} • ${time || ''}`;
  };

  return (
    <div className="event-card glass-card glass-card--interactive">
      <div className="event-card__media">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={title} className="event-card__image" />
        ) : (
          <div className="event-card__image-placeholder">
            <Calendar size={48} />
          </div>
        )}
        {getTagBadge()}
      </div>

      <div className="event-card__body">
        <span className="event-card__date">
          <Calendar size={12} className="mr-xs" />
          {formattedDate()}
        </span>
        <h3 className="event-card__title">
          <Link to={`/events/${id}`}>{title}</Link>
        </h3>
        <p className="event-card__location">
          <MapPin size={12} className="mr-xs" />
          {location}
        </p>
      </div>

      <div className="event-card__footer flex justify-between items-center">
        <div className="event-card__attendees flex items-center">
          <span className="event-card__attendees-count">
            <strong>{attendees.length}</strong> attending
          </span>
        </div>
        {onRSVP && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onRSVP(id);
            }}
            className={`btn btn--sm ${isAttending ? 'btn--secondary' : 'btn--primary'}`}
          >
            {isAttending ? 'Cancel RSVP' : 'RSVP'}
          </button>
        )}
      </div>
    </div>
  );
}

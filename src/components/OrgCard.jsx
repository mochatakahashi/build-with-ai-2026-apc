import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { getInitials } from '../utils/formatters';
import './OrgCard.css';

export default function OrgCard({ org, currentUserId, onJoin, onLeave }) {
  const { id, name, description, category, logoUrl, members = {} } = org;
  
  const isMember = currentUserId && !!members[currentUserId];
  const memberCount = Object.keys(members).length;

  const handleJoinClick = (e) => {
    e.preventDefault();
    if (isMember) {
      onLeave(id);
    } else {
      onJoin(id);
    }
  };

  return (
    <div className="org-card glass-card glass-card--interactive">
      <Link to={`/organizations/${id}`} className="org-card__link">
        <div className="org-card__header flex items-center gap-md">
          {logoUrl ? (
            <img src={logoUrl} alt={name} className="org-card__logo" />
          ) : (
            <div className="org-card__logo-placeholder">{getInitials(name)}</div>
          )}
          <div className="org-card__header-text">
            <h3 className="org-card__name">{name}</h3>
            <span className="badge badge--accent org-card__category">{category}</span>
          </div>
        </div>

        <p className="org-card__description">{description}</p>
      </Link>

      <div className="org-card__footer flex justify-between items-center mt-md">
        <span className="org-card__members flex items-center gap-xs">
          <Users size={14} className="text-secondary" />
          <span><strong>{memberCount}</strong> members</span>
        </span>

        {onJoin && onLeave && (
          <button
            onClick={handleJoinClick}
            className={`btn btn--sm ${isMember ? 'btn--secondary' : 'btn--primary'}`}
          >
            {isMember ? 'Joined ✓' : 'Join'}
          </button>
        )}
      </div>
    </div>
  );
}

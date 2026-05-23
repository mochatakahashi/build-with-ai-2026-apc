import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UserMinus, UserPlus } from 'lucide-react';
import { getInitials } from '../utils/formatters';
import './ProfileCard.css';

export default function ProfileCard({ user, isFriend, onFriendAction, isOwnProfile }) {
  const { id, displayName, studentId, avatarUrl, userType } = user;

  return (
    <div className="profile-card glass-card glass-card--interactive">
      <Link to={`/profile/${id}`} className="profile-card__link">
        <div className="profile-card__avatar-container">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="avatar avatar--lg" />
          ) : (
            <div className="avatar avatar--lg avatar--primary">{getInitials(displayName)}</div>
          )}
          <span className={`badge profile-card__badge ${userType === 'faculty' ? 'badge--secondary' : 'badge--primary'}`}>
            {userType}
          </span>
        </div>

        <div className="profile-card__info">
          <h4 className="profile-card__name">{displayName}</h4>
          <p className="profile-card__id">{studentId}</p>
        </div>
      </Link>

      {!isOwnProfile && onFriendAction && (
        <div className="profile-card__actions">
          {isFriend ? (
            <button
              className="btn btn--secondary btn--sm btn--full"
              onClick={() => onFriendAction(id, 'remove')}
            >
              <UserMinus size={14} />
              Remove
            </button>
          ) : (
            <button
              className="btn btn--primary btn--sm btn--full"
              onClick={() => onFriendAction(id, 'add')}
            >
              <UserPlus size={14} />
              Add Friend
            </button>
          )}
        </div>
      )}
    </div>
  );
}

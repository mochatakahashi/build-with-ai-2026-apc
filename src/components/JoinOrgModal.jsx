/**
 * JoinOrgModal Component — CampusConnect
 * Modal for selecting role (Member or Officer) when joining an organization
 */

import React, { useState } from 'react';
import { Users, Crown, Loader2 } from 'lucide-react';
import Modal from './Modal';
import './JoinOrgModal.css';

export default function JoinOrgModal({ isOpen, orgName, onConfirm, onClose, loading = false }) {
  const [selectedRole, setSelectedRole] = useState('member');

  const handleSubmit = () => {
    onConfirm(selectedRole);
    setSelectedRole('member');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Join ${orgName}`} size="md">
      <div className="join-org-modal">
        <p className="join-org-modal__subtitle">
          Choose your initial role in <strong>{orgName}</strong>
        </p>

        <div className="join-org-modal__roles">
          {/* Member Option */}
          <label className={`role-option ${selectedRole === 'member' ? 'role-option--selected' : ''}`}>
            <input
              type="radio"
              name="role"
              value="member"
              checked={selectedRole === 'member'}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-option__input"
            />
            <div className="role-option__content">
              <div className="role-option__header">
                <Users size={24} className="role-option__icon" />
                <h4 className="role-option__title">Member</h4>
              </div>
              <p className="role-option__description">
                View organization updates, browse events, and participate in discussions. Limited management capabilities.
              </p>
            </div>
          </label>

          {/* Officer Option */}
          <label className={`role-option ${selectedRole === 'officer' ? 'role-option--selected' : ''}`}>
            <input
              type="radio"
              name="role"
              value="officer"
              checked={selectedRole === 'officer'}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-option__input"
            />
            <div className="role-option__content">
              <div className="role-option__header">
                <Crown size={24} className="role-option__icon" />
                <h4 className="role-option__title">Officer</h4>
              </div>
              <p className="role-option__description">
                Manage organization page, post events, manage members, and handle administrative duties. Full access.
              </p>
            </div>
          </label>
        </div>

        <div className="join-org-modal__actions flex gap-sm mt-lg justify-end">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spinner-icon" />
                Joining...
              </>
            ) : (
              `Join as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

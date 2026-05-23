import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, ShieldAlert, Award, UserCheck, ShieldOff, Trash2, Calendar, FileText } from 'lucide-react';
import { useOrgs } from '../contexts/OrgContext';
import { useAuth } from '../contexts/AuthContext';
import { useEvents } from '../contexts/EventContext';
import { userService } from '../services/userService';
import { getInitials } from '../utils/formatters';
import EventCard from '../components/EventCard';
import Modal from '../components/Modal';
import './OrgDetailPage.css';

export default function OrgDetailPage() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { events: allEvents, fetchEvents, rsvpEvent } = useEvents();
  const {
    joinOrg,
    leaveOrg,
    promoteToOfficer,
    demoteToMember,
    removeFromOrg,
    fetchOrganizations,
    getOrganization,
  } = useOrgs();

  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'officer' | 'member' | null
  const [membersDetails, setMembersDetails] = useState([]); // Array of { ...user, role }
  const [orgEvents, setOrgEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('members');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Kick confirmation state
  const [kickModalOpen, setKickModalOpen] = useState(false);
  const [userToKick, setUserToKick] = useState(null);

  const fetchOrgDetails = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      // Fetch organization using the context method
      const o = await getOrganization(orgId);
      if (!o) {
        setOrg(null);
        setLoading(false);
        return;
      }
      setOrg(o);
      
      const role = currentUser ? o.members[currentUser.id] || null : null;
      setUserRole(role);

      // Fetch all details for members
      const memberIds = Object.keys(o.members || {});
      const details = await Promise.all(
        memberIds.map(async (mid) => {
          try {
            const u = await userService.getUser(mid);
            return { ...u, role: o.members[mid] };
          } catch {
            return { id: mid, displayName: `Member ${mid}`, avatarUrl: '', studentId: mid, role: o.members[mid] };
          }
        })
      );
      setMembersDetails(details);

      // Fetch events
      await fetchEvents('all', currentUser?.id);
      
      // Filter events belonging to this organization
      const officersList = details.filter((m) => m.role === 'officer').map((m) => m.id);
      const filteredEvents = allEvents.filter(
        (event) => event.organizerId === orgId || officersList.includes(event.organizerId)
      );
      setOrgEvents(filteredEvents);

    } catch (err) {
      console.error('Failed to load organization details:', err);
      setOrg(null);
    } finally {
      setLoading(false);
    }
  }, [orgId, currentUser, fetchEvents, allEvents, getOrganization]);

  useEffect(() => {
    fetchOrgDetails();
  }, [orgId]);

  const handleJoinToggle = async () => {
    if (!org || !currentUser) return;
    setActionLoading(true);
    try {
      if (userRole) {
        // Leave
        if (userRole === 'officer') {
          const officerCount = membersDetails.filter((m) => m.role === 'officer').length;
          if (officerCount <= 1) {
            alert('Cannot leave. You are the last officer. Please promote another member first.');
            return;
          }
        }
        if (window.confirm('Are you sure you want to leave this organization?')) {
          const updated = await leaveOrg(org.id, currentUser.id);
          setOrg(updated);
          setUserRole(null);
          fetchOrgDetails();
        }
      } else {
        // Join
        const updated = await joinOrg(org.id, currentUser.id);
        setOrg(updated);
        setUserRole('member');
        fetchOrgDetails();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (targetId, action) => {
    if (!org || !currentUser) return;
    try {
      let updated;
      if (action === 'promote') {
        updated = await promoteToOfficer(org.id, currentUser.id, targetId);
      } else {
        updated = await demoteToMember(org.id, currentUser.id, targetId);
      }
      setOrg(updated);
      fetchOrgDetails();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleKickConfirm = (targetUser) => {
    setUserToKick(targetUser);
    setKickModalOpen(true);
  };

  const handleKickSubmit = async () => {
    if (!org || !currentUser || !userToKick) return;
    try {
      const updated = await removeFromOrg(org.id, currentUser.id, userToKick.id);
      setOrg(updated);
      setKickModalOpen(false);
      setUserToKick(null);
      fetchOrgDetails();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading club details...</p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="empty-state container">
        <Users className="empty-state__icon" />
        <h2 className="empty-state__title">Club Not Found</h2>
        <p className="empty-state__text">The club you are looking for does not exist.</p>
        <Link to="/organizations" className="btn btn--primary mt-md">
          Back to Clubs
        </Link>
      </div>
    );
  }

  const isOfficer = userRole === 'officer';
  const memberCount = Object.keys(org.members || {}).length;

  return (
    <div className="org-detail-page container">
      {/* Back button */}
      <div className="mt-md">
        <Link to="/organizations" className="org-detail__back">
          <ArrowLeft size={16} />
          Back to Clubs
        </Link>
      </div>

      {/* Org Header glass card */}
      <div className="org-detail-header glass-card mt-sm mb-lg">
        <div className="org-detail-header__content flex justify-between items-center flex-wrap gap-md">
          <div className="flex items-center gap-lg flex-wrap">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="org-detail-header__logo" />
            ) : (
              <div className="org-detail-header__logo-placeholder">{getInitials(org.name)}</div>
            )}
            <div>
              <h1 className="org-detail-header__title">{org.name}</h1>
              <div className="flex items-center gap-sm mt-xs">
                <span className="badge badge--accent">{org.category}</span>
                <span className="org-detail-header__members flex items-center gap-xs">
                  <Users size={14} />
                  {memberCount} members
                </span>
              </div>
            </div>
          </div>

          <button
            className={`btn ${userRole ? 'btn--secondary' : 'btn--primary'}`}
            onClick={handleJoinToggle}
            disabled={actionLoading}
          >
            {userRole ? (userRole === 'officer' ? 'Joined (Officer)' : 'Leave Club') : 'Join Club'}
          </button>
        </div>
      </div>

      <div className="org-detail-layout">
        {/* Main Panel */}
        <div className="org-detail-layout__main">
          {/* About Club */}
          <div className="glass-card p-lg mb-lg">
            <h2 className="org-section-title">About Club</h2>
            <p className="org-detail__description">{org.description}</p>
          </div>

          {/* Tab switches */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'members' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Members
            </button>
            <button
              className={`tab ${activeTab === 'events' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 'members' && (
              <div className="members-list-tab flex flex-col gap-sm">
                {membersDetails.map((member) => (
                  <div key={member.id} className="member-row glass-card p-md flex justify-between items-center">
                    <div className="flex items-center gap-md" onClick={() => navigate(`/profile/${member.id}`)} style={{ cursor: 'pointer' }}>
                      <div className="avatar avatar--md">
                        {member.avatarUrl ? <img src={member.avatarUrl} alt={member.displayName} /> : getInitials(member.displayName)}
                      </div>
                      <div>
                        <h4 className="member-row__name">{member.displayName}</h4>
                        <p className="member-row__meta">ID: {member.studentId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-sm">
                      <span className={`badge ${member.role === 'officer' ? 'badge--secondary' : 'badge--primary'}`}>
                        {member.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'events' && (
              <div className="org-events-list grid grid--2 grid--auto-fill">
                {orgEvents.length === 0 ? (
                  <div className="empty-state">
                    <Calendar className="empty-state__icon" />
                    <h4 className="empty-state__title">No Events Hosted</h4>
                    <p className="empty-state__text">This club has not hosted any events yet.</p>
                  </div>
                ) : (
                  orgEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRSVP={(id) => rsvpEvent(id, currentUser.id)}
                      currentUserId={currentUser?.id}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Officer RBAC Panel */}
        <div className="org-detail-layout__sidebar">
          {isOfficer && (
            <div className="glass-card p-md officer-panel">
              <div className="officer-panel__header flex items-center gap-sm mb-md">
                <ShieldAlert className="officer-panel__icon text-gradient" size={20} />
                <h3 className="officer-panel__title mb-0">Officer Panel</h3>
              </div>
              <p className="officer-panel__hint mb-lg">You are an officer in this club. Manage roles and members below.</p>

              <div className="officer-member-list flex flex-col gap-md">
                {membersDetails.map((member) => (
                  <div key={member.id} className="officer-member-row flex justify-between items-center py-xs border-bottom">
                    <div>
                      <h5 className="officer-member-row__name">{member.displayName}</h5>
                      <span className="badge badge--lg text-xs" style={{ padding: 0, textTransform: 'capitalize' }}>
                        {member.role}
                      </span>
                    </div>

                    <div className="officer-member-row__actions flex gap-xs">
                      {member.id !== currentUser.id && (
                        <>
                          {member.role === 'member' ? (
                            <button
                              className="btn btn--icon btn--sm btn--secondary"
                              onClick={() => handleRoleChange(member.id, 'promote')}
                              title="Promote to Officer"
                            >
                              <Award size={14} className="color-success" />
                            </button>
                          ) : (
                            <button
                              className="btn btn--icon btn--sm btn--secondary"
                              onClick={() => handleRoleChange(member.id, 'demote')}
                              title="Demote to Member"
                            >
                              <ShieldOff size={14} className="color-warning" />
                            </button>
                          )}
                          <button
                            className="btn btn--icon btn--sm btn--danger"
                            onClick={() => handleKickConfirm(member)}
                            title="Remove Member"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kick Member Confirmation Modal */}
      <Modal isOpen={kickModalOpen} onClose={() => setKickModalOpen(false)} title="Remove Member" size="sm">
        {userToKick && (
          <div className="kick-confirm-dialog text-center">
            <Trash2 size={40} className="text-gradient mb-sm" />
            <h3>Are you sure?</h3>
            <p className="mt-sm mb-lg text-secondary">
              This will remove <strong>{userToKick.displayName}</strong> from the organization. They will lose access to club-exclusive channels and events.
            </p>
            <div className="flex gap-sm justify-center">
              <button className="btn btn--secondary" onClick={() => setKickModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn--danger" onClick={handleKickSubmit}>
                Confirm Remove
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Shield, Globe, ArrowLeft, Users, QrCode, CheckCircle, Clock } from 'lucide-react';
import { useEvents } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { getEventAttendance } from '../services/attendanceService';
import { userService } from '../services/userService';
import { formatDate, formatRelativeTime, getInitials } from '../utils/formatters';
import Modal from '../components/Modal';
import QRCodeGenerator from '../components/QRCodeGenerator';
import QRCodeScanner from '../components/QRCodeScanner';
import './EventDetailPage.css';

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { getEvent, rsvpEvent, deleteEvent } = useEvents();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [attendeesDetails, setAttendeesDetails] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Modals state
  const [qrGenOpen, setQrGenOpen] = useState(false);
  const [qrScanOpen, setQrScanOpen] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const e = await getEvent(eventId);
      if (!e) {
        setEvent(null);
        return;
      }
      setEvent(e);
      setIsOrganizer(currentUser?.id === e.organizerId);
      setIsAttending(e.attendees?.includes(currentUser?.id) || false);

      // Fetch details of attendees
      const details = await Promise.all(
        (e.attendees || []).map(async (uid) => {
          try {
            return await userService.getUser(uid);
          } catch {
            return { id: uid, displayName: `User ${uid}`, avatarUrl: '' };
          }
        })
      );
      setAttendeesDetails(details);

      // Fetch attendance log
      await fetchAttendanceLog();
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId, currentUser, getEvent]);

  const fetchAttendanceLog = async () => {
    if (!eventId) return;
    setLoadingAttendance(true);
    try {
      const records = await getEventAttendance(eventId);
      setAttendanceRecords(records);
    } catch (err) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleRSVPToggle = async () => {
    if (!event || !currentUser) return;
    try {
      const { updatedEvent, isAttending: newAttending } = await rsvpEvent(event.id, currentUser.id);
      setIsAttending(newAttending);
      setEvent(updatedEvent);
      
      // Update local attendees list
      if (newAttending) {
        setAttendeesDetails((prev) => [...prev, currentUser]);
      } else {
        setAttendeesDetails((prev) => prev.filter((u) => u.id !== currentUser.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to cancel and delete this event?')) {
      try {
        await deleteEvent(event.id);
        navigate('/events');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getTagBadge = () => {
    if (event.tag === 'students-only') {
      return (
        <span className="badge badge--primary event-detail__tag">
          <Shield size={12} />
          Students Only
        </span>
      );
    }
    return (
      <span className="badge badge--success event-detail__tag">
        <Globe size={12} />
        Externals Allowed
      </span>
    );
  };

  const formattedDate = () => {
    if (!event?.date) return '';
    const d = new Date(event.date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="empty-state container">
        <Calendar className="empty-state__icon" />
        <h2 className="empty-state__title">Event Not Found</h2>
        <p className="empty-state__text">The event you are looking for does not exist or has been cancelled.</p>
        <Link to="/events" className="btn btn--primary mt-md">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      {/* Back navigation */}
      <div className="container mt-md">
        <Link to="/events" className="event-detail__back">
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>

      {/* Cover Image Header */}
      <div className="event-detail-hero mt-sm">
        {event.coverImageUrl ? (
          <img src={event.coverImageUrl} alt={event.title} className="event-detail-hero__image" />
        ) : (
          <div className="event-detail-hero__placeholder"></div>
        )}
        <div className="event-detail-hero__overlay">
          <div className="container">
            <div className="event-detail-hero__meta">
              {getTagBadge()}
              <h1 className="event-detail-hero__title">{event.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-lg">
        <div className="event-detail-content">
          {/* Main info column */}
          <div className="event-detail-content__main">
            <div className="glass-card p-lg mb-lg">
              <h2 className="event-section-title">About Event</h2>
              <p className="event-detail__description">
                {event.description || 'No description provided for this event.'}
              </p>
            </div>

            {/* Attendance Section */}
            {isOrganizer && (
              <div className="glass-card p-lg mb-lg">
                <div className="flex justify-between items-center mb-md flex-wrap gap-sm">
                  <h2 className="event-section-title mb-0">Attendance Log</h2>
                  <button className="btn btn--primary btn--sm" onClick={() => setQrScanOpen(true)}>
                    <QrCode size={14} />
                    Scan Attendance QR
                  </button>
                </div>

                {attendanceRecords.length === 0 ? (
                  <div className="attendance-empty text-center py-md">
                    <Users className="attendance-empty__icon" size={32} />
                    <p className="text-secondary mt-xs">No attendance recorded yet. Scan guest QR codes to register.</p>
                  </div>
                ) : (
                  <div className="attendance-table-wrapper">
                    <table className="attendance-table">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Student ID</th>
                          <th>Time Verified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceRecords.map((record) => (
                          <tr key={record.id}>
                            <td>
                              <span className="attendance-name-cell">{record.studentName}</span>
                            </td>
                            <td>
                              <span className="attendance-id-cell">{record.studentId}</span>
                            </td>
                            <td>
                              <span className="attendance-time-cell">
                                <Clock size={12} className="mr-xs" />
                                {formatRelativeTime(record.timestamp)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar column */}
          <div className="event-detail-content__sidebar">
            {/* Quick Actions Card */}
            <div className="glass-card p-md mb-lg">
              <div className="event-meta-list">
                <div className="event-meta-item">
                  <Calendar className="event-meta-item__icon" size={18} />
                  <div>
                    <h5 className="event-meta-item__label">Date & Time</h5>
                    <p className="event-meta-item__value">{formattedDate()}</p>
                    <p className="event-meta-item__subvalue">{event.time}</p>
                  </div>
                </div>

                <div className="event-meta-item mt-md">
                  <MapPin className="event-meta-item__icon" size={18} />
                  <div>
                    <h5 className="event-meta-item__label">Location</h5>
                    <p className="event-meta-item__value">{event.location}</p>
                  </div>
                </div>

                <div className="event-meta-item mt-md">
                  <Users className="event-meta-item__icon" size={18} />
                  <div>
                    <h5 className="event-meta-item__label">Organized By</h5>
                    <p className="event-meta-item__value">{event.organizerName}</p>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="event-detail__actions flex flex-col gap-sm">
                {!isOrganizer && (
                  <button
                    onClick={handleRSVPToggle}
                    className={`btn btn--full ${isAttending ? 'btn--secondary' : 'btn--primary'}`}
                  >
                    {isAttending ? 'Cancel RSVP' : 'RSVP for Event'}
                  </button>
                )}

                {isAttending && !isOrganizer && (
                  <button className="btn btn--success btn--full" onClick={() => setQrGenOpen(true)}>
                    <QrCode size={16} />
                    My Attendance QR
                  </button>
                )}

                {isOrganizer && (
                  <>
                    <button className="btn btn--primary btn--full" onClick={() => setQrScanOpen(true)}>
                      <QrCode size={16} />
                      Verify Attendee QR
                    </button>
                    <button className="btn btn--danger btn--full" onClick={handleDelete}>
                      Cancel Event
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Attendees Stack Card */}
            <div className="glass-card p-md">
              <h3 className="profile-sidebar__title mb-md">Attendees ({attendeesDetails.length})</h3>
              {attendeesDetails.length === 0 ? (
                <p className="text-tertiary text-center py-sm">No RSVPs yet.</p>
              ) : (
                <div className="attendees-list">
                  <div className="avatar-stack mb-md">
                    {attendeesDetails.slice(0, 5).map((u) => (
                      <div className="avatar avatar--sm" key={u.id} title={u.displayName}>
                        {u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} /> : getInitials(u.displayName)}
                      </div>
                    ))}
                    {attendeesDetails.length > 5 && (
                      <div className="avatar avatar--sm avatar--primary flex items-center justify-center font-bold">
                        +{attendeesDetails.length - 5}
                      </div>
                    )}
                  </div>
                  <div className="attendees-grid">
                    {attendeesDetails.slice(0, 4).map((u) => (
                      <div className="attendee-item flex items-center gap-sm mt-xs" key={u.id}>
                        <div className="avatar avatar--xs">
                          {u.avatarUrl ? <img src={u.avatarUrl} alt={u.displayName} /> : getInitials(u.displayName)}
                        </div>
                        <span className="attendee-name-label">{u.displayName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Generator Modal (For Attendees) */}
      <Modal isOpen={qrGenOpen} onClose={() => setQrGenOpen(false)} title="My Attendance QR" size="sm">
        {currentUser && (
          <QRCodeGenerator
            studentId={currentUser.id}
            studentName={currentUser.displayName}
            eventId={event.id}
            eventName={event.title}
          />
        )}
      </Modal>

      {/* QR Code Scanner Modal (For Organizer) */}
      <Modal isOpen={qrScanOpen} onClose={() => setQrScanOpen(false)} title="Verify Attendee Attendance" size="sm">
        {currentUser && (
          <QRCodeScanner
            eventId={event.id}
            eventName={event.title}
            organizerId={currentUser.id}
            onAttendanceRecorded={fetchAttendanceLog}
          />
        )}
      </Modal>
    </div>
  );
}

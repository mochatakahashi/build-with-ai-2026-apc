import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Github, Edit3, UserPlus, UserMinus, FileText, UserCheck, Calendar, Info, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import * as feedService from '../services/feedService';
import { getInitials, formatDate } from '../utils/formatters';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';
import ProfileCard from '../components/ProfileCard';
import './ProfilePage.css';

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  // Edit Profile Form State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    githubUsername: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    const id = userId || currentUser?.id;
    if (!id) {
      navigate('/login');
      return;
    }

    try {
      const u = await userService.getUser(id);
      setProfileUser(u);
      setIsOwnProfile(id === currentUser?.id);
      
      // Determine if they are friends
      if (currentUser && id !== currentUser.id) {
        setIsFriend(currentUser.friends?.includes(id) || false);
      }

      // Fetch friends
      const friends = await userService.getFriends(id);
      setFriendsList(friends);

      // Fetch user's posts
      const allPosts = await feedService.getPosts();
      const filteredPosts = allPosts.filter((post) => post.authorId === id);
      setUserPosts(filteredPosts);

      // Set edit form values
      setEditForm({
        displayName: u.displayName,
        bio: u.bio || '',
        githubUsername: u.githubUsername || '',
      });
    } catch (err) {
      console.error('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser, navigate]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFriendAction = async () => {
    if (!profileUser || !currentUser) return;
    setFriendActionLoading(true);
    try {
      if (isFriend) {
        await userService.removeFriend(currentUser.id, profileUser.id);
        setIsFriend(false);
        setFriendsList((prev) => prev.filter((f) => f.id !== currentUser.id));
      } else {
        await userService.sendFriendRequest(currentUser.id, profileUser.id);
        setIsFriend(true);
        setFriendsList((prev) => [...prev, currentUser]);
      }
      // Re-trigger global auth user refresh so friends lists are updated
      // We don't have a direct refresh inside AuthContext, but let's update profileUser state locally
      fetchProfileData();
    } catch (err) {
      console.error('Failed to update friendship status:', err);
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile(editForm);
      setProfileUser(updated);
      setEditModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="empty-state">
        <Info className="empty-state__icon" />
        <h2 className="empty-state__title">User Not Found</h2>
        <p className="empty-state__text">The user profile does not exist.</p>
      </div>
    );
  }

  return (
    <div className="profile-page container">
      {/* Banner & Header */}
      <div className="profile-header glass-card">
        <div className="profile-header__banner"></div>
        <div className="profile-header__content">
          <div className="profile-header__main-info">
            <div className="profile-header__avatar-wrapper">
              {profileUser.avatarUrl ? (
                <img src={profileUser.avatarUrl} alt={profileUser.displayName} className="avatar avatar--2xl profile-header__avatar" />
              ) : (
                <div className="avatar avatar--2xl avatar--primary profile-header__avatar">{getInitials(profileUser.displayName)}</div>
              )}
              {isOwnProfile && (
                <button className="profile-header__avatar-edit" onClick={() => setEditModalOpen(true)} title="Edit Profile">
                  <Edit3 size={16} />
                </button>
              )}
            </div>

            <div className="profile-header__text">
              <div className="profile-header__name-row">
                <h1 className="profile-header__name">{profileUser.displayName}</h1>
                <span className={`badge ${profileUser.userType === 'faculty' ? 'badge--secondary' : 'badge--primary'}`}>
                  {profileUser.userType}
                </span>
              </div>
              <p className="profile-header__id">ID: {profileUser.studentId}</p>
              <p className="profile-header__email">{profileUser.email}</p>
              {profileUser.githubUsername && (
                <a
                  href={`https://github.com/${profileUser.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-header__github"
                >
                  <Github size={16} />
                  github.com/{profileUser.githubUsername}
                </a>
              )}
            </div>
          </div>

          <div className="profile-header__actions">
            {isOwnProfile ? (
              <button className="btn btn--secondary" onClick={() => setEditModalOpen(true)}>
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <button
                className={`btn ${isFriend ? 'btn--secondary' : 'btn--primary'}`}
                onClick={handleFriendAction}
                disabled={friendActionLoading}
              >
                {friendActionLoading ? (
                  <Loader2 className="spinner-icon" size={16} />
                ) : isFriend ? (
                  <>
                    <UserMinus size={16} />
                    Unfriend
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Add Friend
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat__number">{userPosts.length}</span>
            <span className="profile-stat__label">Posts</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__number">{friendsList.length}</span>
            <span className="profile-stat__label">Friends</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__number">{(profileUser.organizations || []).length}</span>
            <span className="profile-stat__label">Organizations</span>
          </div>
        </div>
      </div>

      <div className="profile-content mt-lg">
        {/* Left Column: Details & Friends */}
        <div className="profile-content__sidebar">
          <div className="glass-card p-md mb-lg">
            <h3 className="profile-sidebar__title">About</h3>
            <p className="profile-sidebar__bio">
              {profileUser.bio || "No biography provided yet."}
            </p>
            <div className="divider"></div>
            <div className="profile-sidebar__meta">
              <div className="profile-sidebar__meta-item">
                <Calendar size={16} />
                <span>Joined {formatDate(profileUser.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-md">
            <div className="profile-sidebar__header flex justify-between items-center mb-md">
              <h3 className="profile-sidebar__title mb-0">Friends</h3>
              <span className="badge badge--accent">{friendsList.length}</span>
            </div>
            {friendsList.length === 0 ? (
              <p className="profile-sidebar__empty">No friends added yet.</p>
            ) : (
              <div className="profile-sidebar__friends-stack">
                <div className="avatar-stack mb-sm">
                  {friendsList.slice(0, 5).map((f) => (
                    <div className="avatar avatar--sm" key={f.id} title={f.displayName}>
                      {f.avatarUrl ? <img src={f.avatarUrl} alt={f.displayName} /> : getInitials(f.displayName)}
                    </div>
                  ))}
                  {friendsList.length > 5 && (
                    <div className="avatar avatar--sm avatar--primary flex items-center justify-center font-bold">
                      +{friendsList.length - 5}
                    </div>
                  )}
                </div>
                <div className="profile-sidebar__friends-grid">
                  {friendsList.slice(0, 3).map((f) => (
                    <div className="profile-sidebar__friend-item" key={f.id} onClick={() => navigate(`/profile/${f.id}`)}>
                      <span className="profile-sidebar__friend-name">{f.displayName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="profile-content__main">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'posts' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              <FileText size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Posts
            </button>
            <button
              className={`tab ${activeTab === 'about' ? 'tab--active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <Info size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              About Details
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'posts' && (
              <div className="profile-posts-list">
                {userPosts.length === 0 ? (
                  <div className="empty-state">
                    <FileText className="empty-state__icon" />
                    <h4 className="empty-state__title">No Posts Yet</h4>
                    <p className="empty-state__text">This user has not shared any updates.</p>
                  </div>
                ) : (
                  userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="glass-card p-lg profile-about-details">
                <h3 className="mb-md">Profile Information</h3>
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-info-label">Full Name</span>
                    <span className="profile-info-value">{profileUser.displayName}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Account Email</span>
                    <span className="profile-info-value">{profileUser.email}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">Student / Employee ID</span>
                    <span className="profile-info-value">{profileUser.studentId}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">User Type</span>
                    <span className="profile-info-value text-gradient font-bold">{profileUser.userType}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">GitHub Account</span>
                    <span className="profile-info-value">
                      {profileUser.githubUsername ? (
                        <a href={`https://github.com/${profileUser.githubUsername}`} target="_blank" rel="noopener noreferrer">
                          {profileUser.githubUsername}
                        </a>
                      ) : (
                        'Not linked'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Profile" size="md">
        <form onSubmit={handleEditSubmit} className="edit-profile-form">
          <div className="form-group">
            <label className="form-label" htmlFor="edit-displayName">Display Name</label>
            <input
              id="edit-displayName"
              type="text"
              className="form-input"
              value={editForm.displayName}
              onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              required
            />
          </div>

          <div className="form-group mt-md">
            <label className="form-label" htmlFor="edit-bio">Bio</label>
            <textarea
              id="edit-bio"
              className="form-input form-textarea"
              placeholder="Tell others about yourself..."
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
            />
          </div>

          <div className="form-group mt-md">
            <label className="form-label" htmlFor="edit-github">GitHub Username</label>
            <input
              id="edit-github"
              type="text"
              className="form-input"
              placeholder="github-username"
              value={editForm.githubUsername}
              onChange={(e) => setEditForm({ ...editForm, githubUsername: e.target.value })}
            />
          </div>

          <div className="edit-profile-actions mt-lg flex justify-end gap-sm">
            <button type="button" className="btn btn--secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="spinner-icon" size={16} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

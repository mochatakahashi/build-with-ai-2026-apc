import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Compass } from 'lucide-react';
import { useOrgs } from '../contexts/OrgContext';
import { useAuth } from '../contexts/AuthContext';
import OrgCard from '../components/OrgCard';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import JoinOrgModal from '../components/JoinOrgModal';
import './OrganizationsPage.css';

export default function OrganizationsPage() {
  const {
    organizations,
    loading,
    searchQuery,
    activeCategory,
    setCategory,
    setSearch,
    joinOrg,
    leaveOrg,
    createOrg,
  } = useOrgs();

  const { user: currentUser } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedOrgForJoin, setSelectedOrgForJoin] = useState(null);
  const [joiningOrgId, setJoiningOrgId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'academic',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSearchChange = (val) => {
    setSearch(val);
  };

  const handleJoinOrgClick = (orgId, orgName) => {
    setSelectedOrgForJoin({ id: orgId, name: orgName });
    setJoinModalOpen(true);
  };

  const handleJoinOrgConfirm = async (role) => {
    if (!selectedOrgForJoin || !currentUser) return;
    
    setJoiningOrgId(selectedOrgForJoin.id);
    try {
      await joinOrg(selectedOrgForJoin.id, currentUser.id, role);
      setJoinModalOpen(false);
      setSelectedOrgForJoin(null);
    } catch (err) {
      console.error(err);
    } finally {
      setJoiningOrgId(null);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) return;

    setSubmitting(true);
    try {
      await createOrg(form, currentUser.id);
      setForm({ name: '', description: '', category: 'academic' });
      setCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { key: 'all', label: 'All Categories' },
    { key: 'academic', label: 'Academic' },
    { key: 'technology', label: 'Technology' },
    { key: 'sports', label: 'Sports' },
    { key: 'cultural', label: 'Cultural' },
    { key: 'social', label: 'Social' },
  ];

  return (
    <div className="orgs-page container">
      {/* Header section */}
      <div className="orgs-page__header flex justify-between items-center flex-wrap gap-md">
        <div>
          <h1 className="orgs-page__title text-gradient">Campus Clubs</h1>
          <p className="orgs-page__subtitle">Find your community and make an impact</p>
        </div>
        <button className="btn btn--primary" onClick={() => setCreateModalOpen(true)}>
          <Plus size={18} />
          Register Club
        </button>
      </div>

      {/* Search & Filter section */}
      <div className="orgs-page__controls flex flex-col gap-md mb-lg">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search clubs by name or keywords..."
        />

        <div className="orgs-page__tabs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`orgs-page__tab ${activeCategory === cat.key ? 'orgs-page__tab--active' : ''}`}
              onClick={() => setCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Orgs */}
      {loading ? (
        <div className="orgs-page__loading">
          <div className="loading-spinner" />
          <p className="loading-text">Loading campus organizations...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="empty-state glass-card">
          <Compass className="empty-state__icon" />
          <h3 className="empty-state__title">No Clubs Found</h3>
          <p className="empty-state__text">
            {searchQuery
              ? 'No clubs match your query. Try searching for other terms.'
              : 'No clubs registered in this category yet.'}
          </p>
          {!searchQuery && (
            <button className="btn btn--primary mt-md" onClick={() => setCreateModalOpen(true)}>
              Register a Club
            </button>
          )}
        </div>
      ) : (
        <div className="orgs-page__grid grid grid--3 grid--auto-fill">
          {organizations.map((org) => (
            <div key={org.id} className="orgs-page__grid-item">
              <OrgCard
                org={org}
                currentUserId={currentUser?.id}
                onJoin={(id) => handleJoinOrgClick(id, organizations.find((o) => o.id === id)?.name || 'Organization')}
                onLeave={(id) => leaveOrg(id, currentUser.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create Org Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register Campus Club" size="md">
        <form onSubmit={handleCreateSubmit} className="create-org-form">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Club Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="e.g. Asia Pacific College Web Developers"
              value={form.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group mt-md">
            <label className="form-label" htmlFor="description">About / Description</label>
            <textarea
              id="description"
              className="form-input form-textarea"
              placeholder="What does your club do? Who can join? List goals or activities..."
              value={form.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div className="form-group mt-md">
            <label className="form-label" htmlFor="category">Club Category</label>
            <select
              id="category"
              className="form-input"
              value={form.category}
              onChange={handleInputChange}
            >
              <option value="academic">Academic</option>
              <option value="technology">Technology</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
              <option value="social">Social</option>
            </select>
          </div>

          <div className="create-org-actions mt-lg flex justify-end gap-sm">
            <button type="button" className="btn btn--secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Club'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Join Organization Modal with Role Selection */}
      <JoinOrgModal
        isOpen={joinModalOpen}
        orgName={selectedOrgForJoin?.name || 'Organization'}
        onConfirm={handleJoinOrgConfirm}
        onClose={() => {
          setJoinModalOpen(false);
          setSelectedOrgForJoin(null);
        }}
        loading={joiningOrgId !== null}
      />
    </div>
  );
}

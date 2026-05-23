import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orgService } from '../services/orgService';
import { useToast } from './ToastContext';

const OrgContext = createContext(null);

export function OrgProvider({ children }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { showToast } = useToast();

  const fetchOrganizations = useCallback(async (category = null, search = '') => {
    setLoading(true);
    try {
      const fetched = await orgService.getOrganizations(category, search);
      setOrganizations(fetched);
    } catch (error) {
      showToast('Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchOrganizations(activeCategory, searchQuery);
  }, [activeCategory, searchQuery, fetchOrganizations]);

  const joinOrg = async (orgId, userId, role = 'member') => {
    try {
      const updated = await orgService.joinOrganization(orgId, userId, role);
      setOrganizations((prev) => prev.map((o) => (o.id === orgId ? updated : o)));
      showToast(`Successfully joined organization as ${role}!`, 'success');
      return updated;
    } catch (error) {
      showToast(error.message || 'Failed to join organization', 'error');
      throw error;
    }
  };

  const leaveOrg = async (orgId, userId) => {
    try {
      const updated = await orgService.leaveOrganization(orgId, userId);
      setOrganizations((prev) => prev.map((o) => (o.id === orgId ? updated : o)));
      showToast('You have left the organization', 'info');
      return updated;
    } catch (error) {
      showToast(error.message || 'Failed to leave organization', 'error');
      throw error;
    }
  };

  const promoteToOfficer = async (orgId, userId, targetUserId) => {
    try {
      const updated = await orgService.promoteToOfficer(orgId, userId, targetUserId);
      setOrganizations((prev) => prev.map((o) => (o.id === orgId ? updated : o)));
      showToast('Member promoted to Officer', 'success');
      return updated;
    } catch (error) {
      showToast(error.message || 'Failed to promote member', 'error');
      throw error;
    }
  };

  const demoteToMember = async (orgId, userId, targetUserId) => {
    try {
      const updated = await orgService.demoteToMember(orgId, userId, targetUserId);
      setOrganizations((prev) => prev.map((o) => (o.id === orgId ? updated : o)));
      showToast('Officer demoted to Member', 'info');
      return updated;
    } catch (error) {
      showToast(error.message || 'Failed to demote officer', 'error');
      throw error;
    }
  };

  const removeFromOrg = async (orgId, userId, targetUserId) => {
    try {
      const updated = await orgService.removeFromOrg(orgId, userId, targetUserId);
      setOrganizations((prev) => prev.map((o) => (o.id === orgId ? updated : o)));
      showToast('Member removed from organization', 'warning');
      return updated;
    } catch (error) {
      showToast(error.message || 'Failed to remove member', 'error');
      throw error;
    }
  };

  const createOrg = async (orgData, creatorId) => {
    try {
      const newOrg = await orgService.createOrganization(orgData, creatorId);
      setOrganizations((prev) => [newOrg, ...prev]);
      showToast('Organization created successfully!', 'success');
      return newOrg;
    } catch (error) {
      showToast('Failed to create organization', 'error');
      throw error;
    }
  };

  const getOrganization = useCallback(async (orgId) => {
    try {
      const org = await orgService.getOrganization(orgId);
      return org;
    } catch (error) {
      console.error('Failed to load organization:', error);
      return null;
    }
  }, []);

  const setCategory = (category) => {
    setActiveCategory(category);
  };

  const setSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <OrgContext.Provider
      value={{
        organizations,
        loading,
        searchQuery,
        activeCategory,
        setCategory,
        setSearch,
        fetchOrganizations,
        getOrganization,
        joinOrg,
        leaveOrg,
        promoteToOfficer,
        demoteToMember,
        removeFromOrg,
        createOrg,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrgs() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrgs must be used within an OrgProvider');
  }
  return context;
}

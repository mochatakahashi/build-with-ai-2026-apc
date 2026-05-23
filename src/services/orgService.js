import { mockOrgs } from '../data/mockOrgs';
import { userService } from './userService';

const STORAGE_KEY = 'cc_organizations';

const _getOrgs = () => {
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (!local) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrgs));
      return mockOrgs;
    }
    return JSON.parse(local);
  } catch (e) {
    return mockOrgs;
  }
};

const _saveOrgs = (orgs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs));
};

export const orgService = {
  getOrganizations: async (category = null, search = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let orgs = _getOrgs();
        if (category && category !== 'all') {
          orgs = orgs.filter((o) => o.category === category);
        }
        if (search) {
          const q = search.toLowerCase();
          orgs = orgs.filter((o) => o.name.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
        }
        resolve(orgs);
      }, 300);
    });
  },

  getOrganization: async (orgId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orgs = _getOrgs();
        const org = orgs.find((o) => o.id === orgId);
        if (!org) return reject(new Error('Organization not found'));
        resolve(org);
      }, 200);
    });
  },

  joinOrganization: async (orgId, userId, role = 'member') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orgs = _getOrgs();
        const index = orgs.findIndex((o) => o.id === orgId);
        if (index === -1) return reject(new Error('Organization not found'));

        const org = orgs[index];
        if (org.members[userId]) return reject(new Error('Already a member'));

        const validRole = role === 'officer' ? 'officer' : 'member';

        org.members = {
          ...org.members,
          [userId]: validRole,
        };

        const updatedOrgs = [...orgs];
        updatedOrgs[index] = org;
        _saveOrgs(updatedOrgs);
        resolve(org);
      }, 300);
    });
  },

  leaveOrganization: async (orgId, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orgs = _getOrgs();
        const index = orgs.findIndex((o) => o.id === orgId);
        if (index === -1) return reject(new Error('Organization not found'));

        const org = orgs[index];
        if (!org.members[userId]) return reject(new Error('Not a member'));

        // Prevent leaving if last officer
        if (org.members[userId] === 'officer') {
          const officerCount = Object.values(org.members).filter((role) => role === 'officer').length;
          if (officerCount <= 1) {
            return reject(new Error('Cannot leave. You are the last officer. Promote another member first.'));
          }
        }

        const newMembers = { ...org.members };
        delete newMembers[userId];
        org.members = newMembers;

        const updatedOrgs = [...orgs];
        updatedOrgs[index] = org;
        _saveOrgs(updatedOrgs);
        resolve(org);
      }, 300);
    });
  },

  promoteToOfficer: async (orgId, userId, targetUserId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orgs = _getOrgs();
        const index = orgs.findIndex((o) => o.id === orgId);
        if (index === -1) return reject(new Error('Organization not found'));

        const org = orgs[index];
        if (org.members[userId] !== 'officer') {
          return reject(new Error('Unauthorized. Only officers can manage roles.'));
        }

        if (!org.members[targetUserId]) {
          return reject(new Error('Target user is not a member.'));
        }

        org.members = {
          ...org.members,
          [targetUserId]: 'officer',
        };

        const updatedOrgs = [...orgs];
        updatedOrgs[index] = org;
        _saveOrgs(updatedOrgs);
        resolve(org);
      }, 300);
    });
  },

  demoteToMember: async (orgId, userId, targetUserId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orgs = _getOrgs();
        const index = orgs.findIndex((o) => o.id === orgId);
        if (index === -1) return reject(new Error('Organization not found'));

        const org = orgs[index];
        if (org.members[userId] !== 'officer') {
          return reject(new Error('Unauthorized. Only officers can manage roles.'));
        }

        if (org.members[targetUserId] !== 'officer') {
          return reject(new Error('Target user is not an officer.'));
        }

        // Prevent self demotion if last officer
        if (userId === targetUserId) {
          const officerCount = Object.values(org.members).filter((role) => role === 'officer').length;
          if (officerCount <= 1) {
            return reject(new Error('Cannot demote yourself. You are the last officer.'));
          }
        }

        org.members = {
          ...org.members,
          [targetUserId]: 'member',
        };

        const updatedOrgs = [...orgs];
        updatedOrgs[index] = org;
        _saveOrgs(updatedOrgs);
        resolve(org);
      }, 300);
    });
  },

  removeFromOrg: async (orgId, userId, targetUserId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orgs = _getOrgs();
        const index = orgs.findIndex((o) => o.id === orgId);
        if (index === -1) return reject(new Error('Organization not found'));

        const org = orgs[index];
        if (org.members[userId] !== 'officer') {
          return reject(new Error('Unauthorized. Only officers can remove members.'));
        }

        if (!org.members[targetUserId]) {
          return reject(new Error('Target user is not a member.'));
        }

        if (org.members[targetUserId] === 'officer' && userId !== targetUserId) {
          return reject(new Error('Cannot remove another officer directly. Demote them first.'));
        }

        const newMembers = { ...org.members };
        delete newMembers[targetUserId];
        org.members = newMembers;

        const updatedOrgs = [...orgs];
        updatedOrgs[index] = org;
        _saveOrgs(updatedOrgs);
        resolve(org);
      }, 300);
    });
  },

  getUserRole: async (orgId, userId) => {
    try {
      const orgs = _getOrgs();
      const org = orgs.find((o) => o.id === orgId);
      return org ? org.members[userId] || null : null;
    } catch {
      return null;
    }
  },

  createOrganization: async (data, creatorId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOrg = {
          id: 'org-' + Date.now(),
          logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(data.name)}`,
          members: {
            [creatorId]: 'officer',
          },
          events: [],
          createdAt: new Date().toISOString(),
          ...data,
        };

        const orgs = _getOrgs();
        orgs.unshift(newOrg);
        _saveOrgs(orgs);
        resolve(newOrg);
      }, 400);
    });
  },
};

export default orgService;

import { mockUsers } from '../data/mockUsers';
import { authService } from './authService';

const STORAGE_USERS_KEY = 'cc_users';

const _getUsers = () => {
  try {
    const local = localStorage.getItem(STORAGE_USERS_KEY);
    if (!local) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(mockUsers));
      return mockUsers;
    }
    return JSON.parse(local);
  } catch (e) {
    return mockUsers;
  }
};

const _saveUsers = (users) => {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
};

export const userService = {
  getUser: async (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = _getUsers();
        const user = users.find((u) => u.id === userId);
        if (!user) return reject(new Error('User not found'));
        
        const cleanUser = { ...user };
        delete cleanUser.password;
        resolve(cleanUser);
      }, 300);
    });
  },

  updateProfile: async (userId, data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = _getUsers();
        const index = users.findIndex((u) => u.id === userId);
        if (index === -1) return reject(new Error('User not found'));

        const updatedUser = {
          ...users[index],
          displayName: data.displayName || users[index].displayName,
          bio: data.bio !== undefined ? data.bio : users[index].bio,
          githubUsername: data.githubUsername !== undefined ? data.githubUsername : users[index].githubUsername,
        };

        const updatedUsers = [...users];
        updatedUsers[index] = updatedUser;
        _saveUsers(updatedUsers);

        // Update local session storage if updating own profile
        const current = authService.getCurrentUser();
        if (current && current.id === userId) {
          const cleanUser = { ...updatedUser };
          delete cleanUser.password;
          authService.updateLocalProfile(cleanUser);
        }

        const cleanUpdated = { ...updatedUser };
        delete cleanUpdated.password;
        resolve(cleanUpdated);
      }, 400);
    });
  },

  sendFriendRequest: async (fromId, toId) => {
    // For mock simplicity, we auto-accept friend request
    return userService.acceptFriendRequest(fromId, toId);
  },

  acceptFriendRequest: async (fromId, toId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = _getUsers();
        const fromIndex = users.findIndex((u) => u.id === fromId);
        const toIndex = users.findIndex((u) => u.id === toId);

        if (fromIndex === -1 || toIndex === -1) {
          return reject(new Error('User not found'));
        }

        const fromUser = users[fromIndex];
        const toUser = users[toIndex];

        // Add to friends list if not already there
        const fromFriends = fromUser.friends || [];
        const toFriends = toUser.friends || [];

        if (!fromFriends.includes(toId)) {
          fromUser.friends = [...fromFriends, toId];
        }
        if (!toFriends.includes(fromId)) {
          toUser.friends = [...toFriends, fromId];
        }

        const updatedUsers = [...users];
        updatedUsers[fromIndex] = fromUser;
        updatedUsers[toIndex] = toUser;
        _saveUsers(updatedUsers);

        // Update current user local session
        const current = authService.getCurrentUser();
        if (current && current.id === fromId) {
          const cleanUser = { ...fromUser };
          delete cleanUser.password;
          authService.updateLocalProfile(cleanUser);
        }

        resolve({ success: true });
      }, 300);
    });
  },

  removeFriend: async (fromId, toId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = _getUsers();
        const fromIndex = users.findIndex((u) => u.id === fromId);
        const toIndex = users.findIndex((u) => u.id === toId);

        if (fromIndex === -1 || toIndex === -1) {
          return reject(new Error('User not found'));
        }

        const fromUser = users[fromIndex];
        const toUser = users[toIndex];

        fromUser.friends = (fromUser.friends || []).filter((id) => id !== toId);
        toUser.friends = (toUser.friends || []).filter((id) => id !== fromId);

        const updatedUsers = [...users];
        updatedUsers[fromIndex] = fromUser;
        updatedUsers[toIndex] = toUser;
        _saveUsers(updatedUsers);

        // Update current user local session
        const current = authService.getCurrentUser();
        if (current && current.id === fromId) {
          const cleanUser = { ...fromUser };
          delete cleanUser.password;
          authService.updateLocalProfile(cleanUser);
        }

        resolve({ success: true });
      }, 300);
    });
  },

  getFriends: async (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = _getUsers();
        const user = users.find((u) => u.id === userId);
        if (!user) return reject(new Error('User not found'));

        const friendIds = user.friends || [];
        const friendsList = users
          .filter((u) => friendIds.includes(u.id))
          .map((u) => {
            const clean = { ...u };
            delete clean.password;
            return clean;
          });

        resolve(friendsList);
      }, 300);
    });
  },

  searchUsers: async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!query || !query.trim()) return resolve([]);
        
        const q = query.toLowerCase();
        const users = _getUsers();
        const results = users
          .filter((u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
          .map((u) => {
            const clean = { ...u };
            delete clean.password;
            return clean;
          });

        resolve(results);
      }, 250);
    });
  },
};

export default userService;

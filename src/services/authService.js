import { mockUsers, DEFAULT_PASSWORD } from '../data/mockUsers';
import { validateEmail } from '../utils/validators';

const STORAGE_USERS_KEY = 'cc_users';
const STORAGE_CURRENT_USER_KEY = 'cc_current_user';

// Helper to initialize users in localStorage
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

export const authService = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const validation = validateEmail(email);
        if (!validation.valid) {
          return reject(new Error(validation.error));
        }

        const users = _getUsers();
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
          return reject(new Error('User not found. Please register.'));
        }

        // Simulating password check (since this is a mock, all default users use DEFAULT_PASSWORD, and newly registered users will store their custom password)
        // For simplicity, we just allow the login or check if password matches
        if (password !== DEFAULT_PASSWORD && password !== user.password) {
          // If the user was registered during this session, they will have their own password stored.
          if (user.password && password !== user.password) {
            return reject(new Error('Incorrect password'));
          } else if (!user.password && password !== DEFAULT_PASSWORD) {
            return reject(new Error('Incorrect password'));
          }
        }

        // Return user without sensitive data (or clean user object)
        const loggedUser = { ...user };
        delete loggedUser.password;
        
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(loggedUser));
        resolve(loggedUser);
      }, 500);
    });
  },

  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const { email, displayName, studentId, githubUsername, password } = userData;
        const validation = validateEmail(email);
        if (!validation.valid) {
          return reject(new Error(validation.error));
        }

        if (!displayName || !displayName.trim()) {
          return reject(new Error('Full Name is required'));
        }

        if (!studentId || !studentId.trim()) {
          return reject(new Error('Student/Employee ID is required'));
        }

        const users = _getUsers();
        const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          return reject(new Error('An account with this email already exists.'));
        }

        const userType = validation.userType;
        const id = `user-${Date.now()}`;
        const seed = encodeURIComponent(displayName);
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=3b82f6`;

        const newUser = {
          id,
          email: email.toLowerCase(),
          displayName,
          studentId,
          githubUsername: githubUsername || '',
          avatarUrl,
          bio: `Hello! I am a ${userType} at APC.`,
          userType,
          friends: [],
          organizations: [],
          password, // Storing password for login validation in mock
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUser];
        _saveUsers(updatedUsers);

        const cleanUser = { ...newUser };
        delete cleanUser.password;

        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(cleanUser));
        resolve(cleanUser);
      }, 800);
    });
  },

  logout: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
        resolve();
      }, 300);
    });
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  updateLocalProfile: (updatedUser) => {
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(updatedUser));
  }
};
export default authService;

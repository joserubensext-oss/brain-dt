// ====================================
// AUTHENTICATION MODULE
// Using localStorage for MVP
// ====================================

const Auth = {
  // Storage keys
  STORAGE_KEY: 'braindt_user',
  TOKEN_KEY: 'braindt_token',
  THEME_KEY: 'braindt_theme',

  // Current user session
  currentUser: null,
  isAuthenticated: false,

  /**
   * Initialize auth module
   */
  init() {
    this.loadUser();
    this.loadTheme();
    this.setupEventListeners();
    console.log('Auth module initialized');
  },

  /**
   * Register new user
   */
  register(username, email, password) {
    // Validate inputs
    if (!username || !email || !password) {
      throw new Error('Usuário, email e senha são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    // Check if user exists
    const existingUser = localStorage.getItem(`${this.STORAGE_KEY}_${email}`);
    if (existingUser) {
      throw new Error('Este email já está registrado');
    }

    // Create user object
    const user = {
      id: this.generateId(),
      username,
      email,
      password: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      modules: ['dashboard'], // Default modules
      accessLevel: 'basic'
    };

    // Save user
    localStorage.setItem(`${this.STORAGE_KEY}_${email}`, JSON.stringify(user));

    return {
      success: true,
      message: 'Usuário registrado com sucesso!'
    };
  },

  /**
   * Login user
   */
  login(email, password) {
    const userData = localStorage.getItem(`${this.STORAGE_KEY}_${email}`);
    
    if (!userData) {
      throw new Error('Email ou senha incorretos');
    }

    const user = JSON.parse(userData);

    // Verify password
    if (user.password !== this.hashPassword(password)) {
      throw new Error('Email ou senha incorretos');
    }

    // Generate token
    const token = this.generateToken();

    // Store session
    this.currentUser = user;
    this.isAuthenticated = true;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, token);

    return {
      success: true,
      user,
      token
    };
  },

  /**
   * Logout user
   */
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    return { success: true };
  },

  /**
   * Load user from localStorage
   */
  loadUser() {
    const userData = localStorage.getItem(this.STORAGE_KEY);
    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.isAuthenticated = true;
    }
  },

  /**
   * Load theme preference
   */
  loadTheme() {
    const theme = localStorage.getItem(this.THEME_KEY) || 'dark';
    this.setTheme(theme);
  },

  /**
   * Set application theme
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Logout button listener
    const logoutBtn = document.querySelector('[data-action="logout"]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  },

  /**
   * Generate user ID
   */
  generateId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Generate session token
   */
  generateToken() {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  },

  /**
   * Hash password (simple implementation for MVP)
   * TODO: Replace with proper hashing library
   */
  hashPassword(password) {
    // Simple hash for MVP - NOT SECURE FOR PRODUCTION
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  },

  /**
   * Check if user has access to module
   */
  hasModuleAccess(moduleName) {
    if (!this.currentUser) return false;
    return this.currentUser.modules.includes(moduleName);
  },

  /**
   * Grant module access
   */
  grantModuleAccess(email, moduleName) {
    const userData = localStorage.getItem(`${this.STORAGE_KEY}_${email}`);
    if (!userData) throw new Error('Usuário não encontrado');

    const user = JSON.parse(userData);
    if (!user.modules.includes(moduleName)) {
      user.modules.push(moduleName);
      localStorage.setItem(`${this.STORAGE_KEY}_${email}`, JSON.stringify(user));

      // Update current user if it's the logged in user
      if (this.currentUser && this.currentUser.email === email) {
        this.currentUser = user;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      }
    }
  },

  /**
   * Revoke module access
   */
  revokeModuleAccess(email, moduleName) {
    const userData = localStorage.getItem(`${this.STORAGE_KEY}_${email}`);
    if (!userData) throw new Error('Usuário não encontrado');

    const user = JSON.parse(userData);
    user.modules = user.modules.filter(m => m !== moduleName);
    localStorage.setItem(`${this.STORAGE_KEY}_${email}`, JSON.stringify(user));

    // Update current user if it's the logged in user
    if (this.currentUser && this.currentUser.email === email) {
      this.currentUser = user;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    }
  }
};

// Initialize auth when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Auth.init());
} else {
  Auth.init();
}

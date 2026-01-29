// ====================================
// MAIN APPLICATION MODULE
// ====================================

const App = {
  // App state
  state: {
    currentPage: 'dashboard',
    user: null,
    trades: [],
    riskConfig: {
      dailyRiskLimit: 1000,
      tradeRiskLimit: 500,
      minRiskReward: 1.5
    }
  },

  /**
   * Initialize application
   */
  init() {
    console.log('Brain DT - Initializing...');
    
    if (!Auth.isAuthenticated) {
      this.showLoginPage();
    } else {
      this.state.user = Auth.currentUser;
      this.setupApplication();
      this.renderDashboard();
    }
  },

  /**
   * Setup application after authentication
   */
  setupApplication() {
    this.loadUserData();
    this.setupEventListeners();
    console.log(`App initialized for user: ${this.state.user.username}`);
  },

  /**
   * Load user data from localStorage
   */
  loadUserData() {
    const userTradesKey = `braindt_trades_${this.state.user.id}`;
    const savedTrades = localStorage.getItem(userTradesKey);
    
    if (savedTrades) {
      this.state.trades = JSON.parse(savedTrades);
    }
  },

  /**
   * Save user data to localStorage
   */
  saveUserData() {
    const userTradesKey = `braindt_trades_${this.state.user.id}`;
    localStorage.setItem(userTradesKey, JSON.stringify(this.state.trades));
  },

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Navigation
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('menu-item')) {
        e.preventDefault();
        const page = e.target.dataset.page || 'dashboard';
        this.navigateTo(page);
      }

      if (e.target.classList.contains('btn-logout')) {
        this.logout();
      }
    });
  },

  /**
   * Navigate to page
   */
  navigateTo(page) {
    this.state.currentPage = page;
    console.log(`Navigating to: ${page}`);
    
    switch(page) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'trades':
        this.renderTradesPage();
        break;
      case 'simulators':
        this.renderSimulatorsPage();
        break;
      default:
        this.renderDashboard();
    }
  },

  /**
   * Render dashboard
   */
  renderDashboard() {
    const stats = this.calculateStats();
    console.log('Dashboard stats:', stats);
    // TODO: Update DOM with dashboard data
  },

  /**
   * Calculate daily statistics
   */
  calculateStats() {
    const today = new Date().toDateString();
    const todaysTrades = this.state.trades.filter(t => 
      new Date(t.date).toDateString() === today
    );

    const totalProfit = todaysTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const winningTrades = todaysTrades.filter(t => t.profit > 0).length;
    const totalTrades = todaysTrades.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(2) : 0;

    return {
      totalProfit,
      totalTrades,
      winningTrades,
      winRate,
      riskUsed: this.calculateRiskUsed(todaysTrades)
    };
  },

  /**
   * Calculate risk used today
   */
  calculateRiskUsed(trades) {
    return trades.reduce((sum, t) => sum + (t.risk || 0), 0);
  },

  /**
   * Add new trade
   */
  addTrade(tradeData) {
    try {
      const trade = {
        id: `trade_${Date.now()}`,
        ...tradeData,
        date: new Date().toISOString(),
        userId: this.state.user.id
      };

      // Validate risk management
      this.validateRiskManagement(trade);

      this.state.trades.push(trade);
      this.saveUserData();

      console.log('Trade added successfully:', trade);
      return { success: true, trade };
    } catch (error) {
      console.error('Error adding trade:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Validate risk management rules
   */
  validateRiskManagement(trade) {
    const today = new Date().toDateString();
    const todaysTrades = this.state.trades.filter(t => 
      new Date(t.date).toDateString() === today
    );

    const todaysRisk = this.calculateRiskUsed(todaysTrades) + (trade.risk || 0);

    if (todaysRisk > this.state.riskConfig.dailyRiskLimit) {
      throw new Error(`Limite de risco diário excedido. Risco: R$ ${todaysRisk}, Limite: R$ ${this.state.riskConfig.dailyRiskLimit}`);
    }

    if ((trade.risk || 0) > this.state.riskConfig.tradeRiskLimit) {
      throw new Error(`Risco da operação excede o limite. Risco: R$ ${trade.risk}, Limite: R$ ${this.state.riskConfig.tradeRiskLimit}`);
    }
  },

  /**
   * Get trade history
   */
  getTradeHistory(limit = 10) {
    return this.state.trades.slice(-limit).reverse();
  },

  /**
   * Render trades page
   */
  renderTradesPage() {
    const trades = this.getTradeHistory();
    console.log('Rendering trades page with', trades.length, 'trades');
    // TODO: Update DOM with trades list
  },

  /**
   * Render simulators page
   */
  renderSimulatorsPage() {
    console.log('Rendering simulators page');
    // TODO: Implement simulators page
  },

  /**
   * Show login page
   */
  showLoginPage() {
    console.log('Showing login page');
    // TODO: Render login/register forms
  },

  /**
   * Logout
   */
  logout() {
    Auth.logout();
    this.state.user = null;
    this.showLoginPage();
    console.log('User logged out');
  },

  /**
   * Update risk configuration
   */
  updateRiskConfig(newConfig) {
    this.state.riskConfig = {
      ...this.state.riskConfig,
      ...newConfig
    };
    localStorage.setItem(
      `braindt_risk_config_${this.state.user.id}`,
      JSON.stringify(this.state.riskConfig)
    );
  }
};

// Initialize app when auth module is ready
if (Auth.isAuthenticated !== undefined) {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// ====================================
// DASHBOARD - RISK MONITORING
// ====================================

const Dashboard = {
  charts: {},
  updateInterval: null,

  /**
   * Initialize dashboard
   */
  init() {
    console.log('Dashboard initialized');
    this.initCharts();
    this.updateMetrics();
    this.setupAutoUpdate();
  },

  /**
   * Initialize Chart.js charts
   */
  initCharts() {
    this.initProfitLossChart();
    this.initRiskGaugeChart();
  },

  /**
   * Initialize Profit/Loss chart
   */
  initProfitLossChart() {
    const ctx = document.getElementById('profitLossChart')?.getContext('2d');
    if (!ctx) return;

    this.charts.profitLoss = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ganhos', 'Perdas'],
        datasets: [{
          label: 'Resultado (R$)',
          data: [0, 0],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#00D9FF',
            bodyColor: '#CBD5E1',
            borderColor: '#00D9FF',
            borderWidth: 1,
            padding: 12,
            displayColors: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(51, 65, 85, 0.3)'
            },
            ticks: {
              color: '#CBD5E1',
              callback: function(value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#CBD5E1'
            }
          }
        }
      }
    });
  },

  /**
   * Initialize Risk Gauge chart
   */
  initRiskGaugeChart() {
    const ctx = document.getElementById('riskGaugeChart')?.getContext('2d');
    if (!ctx) return;

    this.charts.riskGauge = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Risco Utilizado', 'Risco Disponível'],
        datasets: [{
          data: [0, 100],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(51, 65, 85, 0.4)'
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(100, 116, 139, 0.5)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#CBD5E1',
              padding: 20,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#00D9FF',
            bodyColor: '#CBD5E1',
            borderColor: '#00D9FF',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    });
  },

  /**
   * Update all metrics
   */
  updateMetrics() {
    if (!App || !App.state) return;

    const stats = App.calculateStats();
    const riskLimit = App.state.riskConfig.dailyRiskLimit;
    const riskUsed = stats.riskUsed;
    const riskPercent = ((riskUsed / riskLimit) * 100).toFixed(1);

    // Update DOM
    this.updateDOM({
      dailyProfit: stats.totalProfit,
      profitPercent: ((stats.totalProfit / 1000) * 100).toFixed(1),
      riskUsed: riskUsed,
      riskPercent: riskPercent,
      winRate: stats.winRate,
      trades: stats.totalTrades,
      remainingLimit: (riskLimit - riskUsed).toFixed(2)
    });

    // Update charts
    this.updateCharts(stats, riskUsed, riskLimit);
  },

  /**
   * Update DOM elements
   */
  updateDOM(data) {
    const elements = {
      'dailyProfit': (v) => `R$ ${parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'profitPercent': (v) => `${v}%`,
      'riskUsed': (v) => `R$ ${parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      'riskPercent': (v) => `${v}%`,
      'winRate': (v) => `${v}%`,
      'trades': (v) => `${v}`,
      'remainingLimit': (v) => `R$ ${parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    };

    for (const [key, formatter] of Object.entries(elements)) {
      const elem = document.getElementById(key);
      if (elem && data[key] !== undefined) {
        elem.textContent = formatter(data[key]);
      }
    }
  },

  /**
   * Update Chart.js charts
   */
  updateCharts(stats, riskUsed, riskLimit) {
    // Profit/Loss chart
    if (this.charts.profitLoss) {
      const profits = stats.totalProfit > 0 ? stats.totalProfit : 0;
      const losses = stats.totalProfit < 0 ? Math.abs(stats.totalProfit) : 0;
      
      this.charts.profitLoss.data.datasets[0].data = [profits, losses];
      this.charts.profitLoss.update();
    }

    // Risk Gauge chart
    if (this.charts.riskGauge) {
      const riskPercent = (riskUsed / riskLimit) * 100;
      const remainingPercent = 100 - riskPercent;
      
      this.charts.riskGauge.data.datasets[0].data = [riskPercent, remainingPercent];
      
      // Change color based on risk level
      if (riskPercent > 80) {
        this.charts.riskGauge.data.datasets[0].backgroundColor[0] = 'rgba(239, 68, 68, 0.9)'; // Red
      } else if (riskPercent > 50) {
        this.charts.riskGauge.data.datasets[0].backgroundColor[0] = 'rgba(245, 158, 11, 0.8)'; // Amber
      } else {
        this.charts.riskGauge.data.datasets[0].backgroundColor[0] = 'rgba(16, 185, 129, 0.8)'; // Green
      }
      
      this.charts.riskGauge.update();
    }
  },

  /**
   * Setup auto-update interval
   */
  setupAutoUpdate() {
    this.updateInterval = setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
  }
};

// Initialize dashboard when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Dashboard.init());
} else {
  Dashboard.init();
}

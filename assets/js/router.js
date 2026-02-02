/**
 * Router Module - Navegação SPA (Single Page Application)
 * Gerencia rotas e renderização de páginas sem recarregar
 */

const Router = (() => {
  // Cache de páginas compiladas
  const pageCache = {};

  // Definição de rotas
  const routes = {
    '/dashboard': 'Dashboard',
    '/planos': 'Planos',
    '/operacoes': 'Operacoes',
    '/simuladores': 'Simuladores',
    '/configuracoes': 'Configuracoes',
    '/': 'Dashboard' // Rota padrão
  };

  /**
   * Renderiza uma página
   */
  const render = (route) => {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    // Normalizar rota
    let normalizedRoute = route || '/';
    if (normalizedRoute === '') normalizedRoute = '/';

    const pageName = routes[normalizedRoute] || 'Dashboard';

    // Renderizar página
    appContainer.innerHTML = `
      <div class="page-${pageName.toLowerCase()}">
        <h1>${pageName}</h1>
        <p>Página em desenvolvimento: ${pageName}</p>
      </div>
    `;

    // Atualizar estado da navegação
    updateNavigation(normalizedRoute);
  };

  /**
   * Atualiza estado ativo da navegação
   */
  const updateNavigation = (route) => {
    document.querySelectorAll('[data-route]').forEach(el => {
      const elRoute = el.getAttribute('data-route');
      el.classList.toggle('active', elRoute === route);
    });
  };

  /**
   * Navega para uma rota
   */
  const navigate = (path) => {
    window.history.pushState({ path }, '', path === '/' ? '/' : path);
    render(path);
  };

  /**
   * Inicializa o router
   */
  const init = () => {
    // Renderizar página inicial
    render(window.location.pathname || '/');

    // Escutar mudanças de URL
    window.addEventListener('popstate', (e) => {
      render(e.state?.path || '/');
    });

    // Delegated event listener para links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-route]');
      if (link) {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        navigate(route);
      }
    });
  };

  return {
    navigate,
    init,
    routes
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Router;
}

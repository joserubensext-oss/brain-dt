/**
 * Storage Module - Gerenciamento de dados locais
 * Camada de abstraçã para localStorage com CRUD completo
 */

const Storage = (() => {
  const PREFIX = 'braindt_';

  // ===== PLANOS/MESAS =====
  const planos = {
    get: () => JSON.parse(localStorage.getItem(`${PREFIX}planos`)) || [],
    getById: (id) => planos.get().find(p => p.id === id),
    add: (data) => {
      const all = planos.get();
      const novo = {
        id: Date.now().toString(),
        ...data,
        dataCriacao: new Date().toISOString()
      };
      all.push(novo);
      localStorage.setItem(`${PREFIX}planos`, JSON.stringify(all));
      return novo;
    },
    update: (id, data) => {
      const all = planos.get();
      const idx = all.findIndex(p => p.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...data };
        localStorage.setItem(`${PREFIX}planos`, JSON.stringify(all));
        return all[idx];
      }
      return null;
    },
    delete: (id) => {
      const all = planos.get().filter(p => p.id !== id);
      localStorage.setItem(`${PREFIX}planos`, JSON.stringify(all));
    }
  };

  // ===== OPERAÇÕES/TRADES =====
  const operacoes = {
    get: () => JSON.parse(localStorage.getItem(`${PREFIX}operacoes`)) || [],
    getByData: (data) => operacoes.get().filter(o => o.data?.startsWith(data)),
    getByPlano: (planoId) => operacoes.get().filter(o => o.planoId === planoId),
    add: (data) => {
      const all = operacoes.get();
      const nova = {
        id: Date.now().toString(),
        ...data,
        data: new Date().toISOString()
      };
      all.push(nova);
      localStorage.setItem(`${PREFIX}operacoes`, JSON.stringify(all));
      return nova;
    },
    update: (id, data) => {
      const all = operacoes.get();
      const idx = all.findIndex(o => o.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...data };
        localStorage.setItem(`${PREFIX}operacoes`, JSON.stringify(all));
        return all[idx];
      }
      return null;
    },
    delete: (id) => {
      const all = operacoes.get().filter(o => o.id !== id);
      localStorage.setItem(`${PREFIX}operacoes`, JSON.stringify(all));
    }
  };

  // ===== SIMULAÇÕES =====
  const simulacoes = {
    get: () => JSON.parse(localStorage.getItem(`${PREFIX}simulacoes`)) || [],
    add: (data) => {
      const all = simulacoes.get();
      const nova = {
        id: Date.now().toString(),
        ...data,
        data: new Date().toISOString()
      };
      all.push(nova);
      localStorage.setItem(`${PREFIX}simulacoes`, JSON.stringify(all));
      return nova;
    },
    getRecentes: (limite = 10) => simulacoes.get().slice(-limite).reverse()
  };

  // ===== CONFIGURAÇÕES =====
  const config = {
    get: () => JSON.parse(localStorage.getItem(`${PREFIX}config`)) || {
      tema: 'dark',
      alertaLimite: 80,
      setups: ['Rompimento', 'Pullback', 'Prior Cote', '3 Candles'],
      tagsErro: ['entrada_precipitada', 'stop_apertado', 'saida_antecipada'],
      regrasOuro: ''
    },
    set: (data) => {
      localStorage.setItem(`${PREFIX}config`, JSON.stringify(data));
    },
    getTema: () => config.get().tema,
    setTema: (tema) => {
      const cfg = config.get();
      cfg.tema = tema;
      config.set(cfg);
    }
  };

  // ===== ESTATÍSTICAS DO DIA =====
  const stats = {
    getDiaAtual: () => {
      const hoje = new Date().toISOString().split('T')[0];
      const ops = operacoes.getByData(hoje);
      if (ops.length === 0) return null;
      
      const resultado = ops.reduce((acc, op) => acc + (op.resultado || 0), 0);
      const lucros = ops.filter(op => op.resultado > 0).length;
      const prejuizos = ops.filter(op => op.resultado < 0).length;
      const winrate = lucros / ops.length * 100;

      return {
        data: hoje,
        operacoes: ops.length,
        resultado,
        lucros,
        prejuizos,
        winrate: winrate.toFixed(2)
      };
    }
  };

  // ===== CLEAR ALL (para desenvolvimento) =====
  const clear = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(PREFIX)) localStorage.removeItem(key);
    });
  };

  return {
    planos,
    operacoes,
    simulacoes,
    config,
    stats,
    clear
  };
})();

// Export para uso
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}

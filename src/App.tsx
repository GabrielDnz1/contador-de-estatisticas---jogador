import React, { useState, useEffect } from 'react';
import {
  Save,
  Shield,
  Target,
  Footprints,
  ArrowRight,
  Zap,
  Swords,
  Flag,
  ArrowUp,
  ShieldAlert,
  Dices,
  Check,
  X,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface Estatistica {
  nome: string;
  valor: number;
  certos: number;
  errados: number;
  icone: React.ReactNode;
  categoria?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  timerTime: string;
  estatistica: string;
  acao: 'incremento' | 'decremento';
  tipo?: 'certo' | 'errado';
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function App() {
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>(() => {
    const savedStats = localStorage.getItem('estatisticas-jogador');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        return parsedStats.map((stat: Omit<Estatistica, 'icone'>, index: number) => ({
          ...stat,
          valor: Number(stat.valor) || 0,
          certos: Number(stat.certos) || 0,
          errados: Number(stat.errados) || 0,
          icone: getIconForIndex(index)
        }));
      } catch (e) {
        console.error('Error parsing saved stats:', e);
        return getDefaultEstatisticas();
      }
    }
    return getDefaultEstatisticas();
  });

  function getDefaultEstatisticas(): Estatistica[] {
    return [
      // Impedimentos
      { nome: 'Impedimentos', valor: 0, certos: 0, errados: 0, icone: <Flag size={24} />, categoria: 'Impedimentos' },
      
      // Finalizações
      { nome: 'Finalizações', valor: 0, certos: 0, errados: 0, icone: <Target size={24} />, categoria: 'Finalizações' },
      { nome: 'Finalizações no alvo', valor: 0, certos: 0, errados: 0, icone: <Target size={24} />, categoria: 'Finalizações' },
      { nome: 'Cabeceio', valor: 0, certos: 0, errados: 0, icone: <Target size={24} />, categoria: 'Finalizações' },
      { nome: 'Pé Direito', valor: 0, certos: 0, errados: 0, icone: <Footprints size={24} />, categoria: 'Finalizações' },
      { nome: 'Pé Esquerdo', valor: 0, certos: 0, errados: 0, icone: <Footprints size={24} />, categoria: 'Finalizações' },
      
      // Passes
      { nome: 'Passes curtos', valor: 0, certos: 0, errados: 0, icone: <ArrowRight size={24} />, categoria: 'Passes' },
      { nome: 'Passes decisivos', valor: 0, certos: 0, errados: 0, icone: <Zap size={24} />, categoria: 'Passes' },
      { nome: 'Lançamentos', valor: 0, certos: 0, errados: 0, icone: <ArrowUp size={24} />, categoria: 'Passes' },
      { nome: 'Cruzamentos', valor: 0, certos: 0, errados: 0, icone: <ArrowRight size={24} />, categoria: 'Passes' },
      
      // Duelos Ofensivos
      { nome: 'Duelos Ofensivos', valor: 0, certos: 0, errados: 0, icone: <Swords size={24} />, categoria: 'Duelos Ofensivos' },
      { nome: 'Dribles', valor: 0, certos: 0, errados: 0, icone: <Dices size={24} />, categoria: 'Duelos Ofensivos' },
      { nome: 'Faltas Sofridas', valor: 0, certos: 0, errados: 0, icone: <ShieldAlert size={24} />, categoria: 'Duelos Ofensivos' },
      
      // Duelos Aéreos
      { nome: 'Duelos aéreos', valor: 0, certos: 0, errados: 0, icone: <ArrowUp size={24} />, categoria: 'Duelos Aéreos' },
      { nome: 'Duelos aéreos Ofensivos', valor: 0, certos: 0, errados: 0, icone: <ArrowUp size={24} />, categoria: 'Duelos Aéreos' },
      { nome: 'Duelos aéreos Defensivos', valor: 0, certos: 0, errados: 0, icone: <ArrowUp size={24} />, categoria: 'Duelos Aéreos' },
      
      // Duelos Defensivos
      { nome: 'Duelos defensivos', valor: 0, certos: 0, errados: 0, icone: <Shield size={24} />, categoria: 'Duelos Defensivos' },
      { nome: 'Desarmes', valor: 0, certos: 0, errados: 0, icone: <Shield size={24} />, categoria: 'Duelos Defensivos' },
      { nome: 'Roubadas de Bola', valor: 0, certos: 0, errados: 0, icone: <Shield size={24} />, categoria: 'Duelos Defensivos' },
      { nome: 'Interceptações', valor: 0, certos: 0, errados: 0, icone: <Shield size={24} />, categoria: 'Duelos Defensivos' },
      { nome: 'Faltas Cometidas', valor: 0, certos: 0, errados: 0, icone: <ShieldAlert size={24} />, categoria: 'Duelos Defensivos' }
    ];
  }

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<LogEntry[]>(() => {
    const savedLog = localStorage.getItem('estatisticas-jogador-log');
    return savedLog ? JSON.parse(savedLog) : [];
  });

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  useEffect(() => {
    const statsForStorage = estatisticas.map(({ nome, valor, certos, errados, categoria }) => ({
      nome,
      valor: Number(valor) || 0,
      certos: Number(certos) || 0,
      errados: Number(errados) || 0,
      categoria
    }));
    localStorage.setItem('estatisticas-jogador', JSON.stringify(statsForStorage));
  }, [estatisticas]);

  useEffect(() => {
    localStorage.setItem('estatisticas-jogador-log', JSON.stringify(log));
  }, [log]);

  function getIconForIndex(index: number) {
    const icons = [
      <Flag size={24} />,
      <Target size={24} />,
      <Target size={24} />,
      <Target size={24} />,
      <Footprints size={24} />,
      <Footprints size={24} />,
      <ArrowRight size={24} />,
      <Zap size={24} />,
      <ArrowUp size={24} />,
      <ArrowRight size={24} />,
      <Swords size={24} />,
      <Dices size={24} />,
      <ShieldAlert size={24} />,
      <ArrowUp size={24} />,
      <ArrowUp size={24} />,
      <ArrowUp size={24} />,
      <Shield size={24} />,
      <Shield size={24} />,
      <Shield size={24} />,
      <Shield size={24} />,
      <ShieldAlert size={24} />
    ];
    return icons[index] || <Dices size={24} />;
  }

  const addLogEntry = (estatisticaNome: string, acao: 'incremento' | 'decremento', tipo?: 'certo' | 'errado') => {
    const newEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleTimeString(),
      timerTime: formatTime(time),
      estatistica: estatisticaNome,
      acao,
      tipo
    };
    setLog(prevLog => [newEntry, ...prevLog]);
  };

  const incrementar = (index: number, tipo: 'certo' | 'errado') => {
    setEstatisticas(prevEstatisticas => {
      const novasEstatisticas = [...prevEstatisticas];
      novasEstatisticas[index] = {
        ...novasEstatisticas[index],
        valor: (novasEstatisticas[index].valor || 0) + 1,
        certos: tipo === 'certo' ? (novasEstatisticas[index].certos || 0) + 1 : (novasEstatisticas[index].certos || 0),
        errados: tipo === 'errado' ? (novasEstatisticas[index].errados || 0) + 1 : (novasEstatisticas[index].errados || 0)
      };
      return novasEstatisticas;
    });
    addLogEntry(estatisticas[index].nome, 'incremento', tipo);
  };

  const decrementar = (index: number) => {
    setEstatisticas(prevEstatisticas => {
      const novasEstatisticas = [...prevEstatisticas];
      if (novasEstatisticas[index].valor > 0) {
        const certos = novasEstatisticas[index].certos || 0;
        const errados = novasEstatisticas[index].errados || 0;
        
        novasEstatisticas[index] = {
          ...novasEstatisticas[index],
          valor: novasEstatisticas[index].valor - 1,
          certos: certos > 0 ? certos - 1 : 0,
          errados: certos === 0 && errados > 0 ? errados - 1 : errados
        };
        addLogEntry(estatisticas[index].nome, 'decremento');
      }
      return novasEstatisticas;
    });
  };

  const resetar = () => {
    setEstatisticas(estatisticas.map(est => ({ ...est, valor: 0, certos: 0, errados: 0 })));
    setLog([]);
  };

  const removerLog = (id: string) => {
    setLog(prevLog => prevLog.filter(entry => entry.id !== id));
  };

  // Group estatisticas by category
  const categorias = estatisticas.reduce((acc, estatistica) => {
    const categoria = estatistica.categoria || 'Outros';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(estatistica);
    return acc;
  }, {} as Record<string, Estatistica[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-800 to-white-600 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <Save className="text-white-600" />
              Indicadores de Desempenho
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Timer size={20} className="text-white-600" />
                <span className="font-mono text-xl">{formatTime(time)}</span>
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`p-1 rounded ${isRunning ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                >
                  {isRunning ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={() => {
                    setTime(0);
                    setIsRunning(false);
                  }}
                  className="p-1 text-gray-600 hover:text-gray-700"
                >
                  <RotateCcw size={20} />
                </button>
              </div>
              <button
                onClick={resetar}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Zerar Contadores
              </button>
            </div>
          </div>

          {Object.entries(categorias).map(([categoria, items]) => (
            <div key={categoria} className="mb-8">
              <h2 className="text-xl font-bold text-white-700 mb-4 border-b pb-2">{categoria}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((estatistica, originalIndex) => {
                  const index = estatisticas.findIndex(e => e.nome === estatistica.nome);
                  return (
                    <div
                      key={estatistica.nome}
                      className="bg-gray-50 rounded-lg p-4 shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-700">{estatistica.nome}</h3>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => decrementar(index)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-2xl font-bold text-gray-800">{estatistica.valor || 0}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => incrementar(index, 'certo')}
                              className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => incrementar(index, 'errado')}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors flex items-center gap-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm px-1">
                          <span className="text-red-600">Insucesso: {estatistica.errados || 0}</span>
                          <span className="text-green-600">Sucesso: {estatistica.certos || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Ações</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {log.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-500">{entry.timestamp}</span>
                  <span className="font-mono text-sm text-white-600">[{entry.timerTime}]</span>
                  <span className="text-gray-700">
                    {entry.estatistica} ({entry.acao === 'incremento' ? '+1' : '-1'})
                    {entry.tipo && (
                      <span className={entry.tipo === 'certo' ? 'text-green-600' : 'text-red-600'}>
                        {' '}
                        [{entry.tipo === 'certo' ? 'Sucesso' : 'Insucesso'}]
                      </span>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => removerLog(entry.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {log.length === 0 && (
              <p className="text-gray-500 text-center py-4">Nenhuma ação registrada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
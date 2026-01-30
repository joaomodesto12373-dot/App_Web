// client/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export default function Dashboard() {
  const [precoAtual, setPrecoAtual] = useState<number | null>(null);
  const [monitorando, setMonitorando] = useState(false);

  // Buscar monitoramento ativo
  const { data: monitoramento, isLoading } = trpc.monitoring.getActive.useQuery();

  // Mutation para verificar preço
  const verificarPrecMutation = trpc.monitoring.checkPrice.useMutation();

  // Verificar preço a cada 30 segundos
  useEffect(() => {
    if (!monitorando || !monitoramento?.id) return;

    const intervalo = setInterval(async () => {
      try {
        const resultado = await verificarPrecMutation.mutateAsync({
          id: monitoramento.id,
        });
        setPrecoAtual(resultado.precoAtual);
      } catch (erro) {
        console.error('Erro ao verificar preço:', erro);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(intervalo);
  }, [monitorando, monitoramento?.id]);

  if (isLoading) return <p>Carregando...</p>;

  if (!monitoramento) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <p className="text-center text-gray-400">Nenhum monitoramento ativo</p>
      </div>
    );
  }

  const buyPrice = parseFloat(monitoramento.buyPrice);
  const sellPrice = parseFloat(monitoramento.sellPrice);

  // Determinar cor baseado no preço
  let cor = 'text-gray-400';
  if (precoAtual && precoAtual <= buyPrice) cor = 'text-pink-500';
  if (precoAtual && precoAtual >= sellPrice) cor = 'text-cyan-400';

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-500 mb-8">
          Alerta Cota Limite
        </h1>

        {/* Cartão de preço */}
        <div className="p-6 bg-gray-900 rounded border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-pink-500 mb-4">
            {monitoramento.symbol}
          </h2>

          <p className={`text-5xl font-bold ${cor} mb-6`}>
            R$ {precoAtual ? precoAtual.toFixed(2) : '...'}
          </p>

          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-400">
              Limite de Compra: R$ {buyPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400">
              Limite de Venda: R$ {sellPrice.toFixed(2)}
            </p>
          </div>

          {/* Status dos alertas */}
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">
              Alerta de Compra:{' '}
              <span className={monitoramento.buyAlertSent ? 'text-pink-500' : 'text-gray-500'}>
                {monitoramento.buyAlertSent ? '✅ Enviado' : '⏳ Aguardando'}
              </span>
            </p>
            <p className="text-gray-400">
              Alerta de Venda:{' '}
              <span className={monitoramento.sellAlertSent ? 'text-cyan-400' : 'text-gray-500'}>
                {monitoramento.sellAlertSent ? '✅ Enviado' : '⏳ Aguardando'}
              </span>
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className="space-x-4 mb-8">
          <button
            onClick={() => setMonitorando(!monitorando)}
            className={`px-6 py-2 rounded font-bold ${
              monitorando
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {monitorando ? '⏸ Pausar' : '▶ Iniciar'}
          </button>

          <button
            onClick={() => {
              setPrecoAtual(null);
              setMonitorando(false);
            }}
            className="px-6 py-2 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white"
          >
            🔄 Resetar
          </button>
        </div>

        {/* Status */}
        <div className="p-4 bg-gray-900 rounded border border-gray-700">
          <p className="text-gray-400">
            Status: {monitorando ? '🟢 Monitorando' : '🔴 Parado'}
          </p>
        </div>
      </div>
    </div>
  );
}
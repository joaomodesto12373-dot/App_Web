// server/services/brapiService.ts
import axios from 'axios';

interface BrapiResponse {
  results: Array<{
    symbol: string;
    regularMarketPrice: number;
    regularMarketTime: number;
  }>;
}

/**
 * Obter preço atual de um ativo da B3
 * @param symbol - Símbolo do ativo (ex: PETR4)
 * @returns Preço atual
 */
export async function obterPrecoAtual(symbol: string): Promise<number> {
  try {
    const resposta = await axios.get<BrapiResponse>(
      `https://api.brapi.dev/api/quote/${symbol}`
    );

    if (!resposta.data.results || resposta.data.results.length === 0) {
      throw new Error(`Símbolo ${symbol} não encontrado`);
    }

    return resposta.data.results[0].regularMarketPrice;
  } catch (erro) {
    console.error(`Erro ao buscar preço de ${symbol}:`, erro);
    throw new Error(`Não foi possível obter preço de ${symbol}`);
  }
}

/**
 * Obter histórico de preços dos últimos dias
 * @ param symbol - Símbolo do ativo
 * @ param dias - Número de dias (padrão: 30)
 * @ returns Histórico de preços
 */
export async function obterHistoricoPrecos(
  symbol: string,
  dias: number = 30
) {
  try {
    const range = dias <= 7 ? '1mo' : dias <= 30 ? '3mo' : '1y';
    const resposta = await axios.get(
      `https://api.brapi.dev/api/quote/${symbol}?range=${range}&interval=1d`
    );

    return resposta.data;
  } catch (erro) {
    console.error(`Erro ao buscar histórico de ${symbol}:`, erro);
    throw new Error(`Não foi possível obter histórico de ${symbol}`);
  }
}
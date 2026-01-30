// server/db.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, and, desc } from 'drizzle-orm';
import {
  usuarios,
  monitoramentos,
  alertas,
  historicoPrecos,
  smtpConfigs,
} from '../drizzle/schema';

// Criar pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'App_Web',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Criar instância do Drizzle
export const db = drizzle(pool);

// FUNÇÕES DE USUÁRIOS 

export async function obterUsuarioPorOpenId(openId: string) {
  const resultado = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.openId, openId))
    .limit(1);

  return resultado[0] || null;
}

export async function criarOuAtualizarUsuario(dados: {
  openId: string;
  nome?: string;
  email?: string;
}) {
  const usuarioExistente = await obterUsuarioPorOpenId(dados.openId);

  if (usuarioExistente) {
    await db
      .update(usuarios)
      .set({
        nome: dados.nome || usuarioExistente.nome,
        email: dados.email || usuarioExistente.email,
      })
      .where(eq(usuarios.openId, dados.openId));

    return usuarioExistente;
  }

  const resultado = await db.insert(usuarios).values({
    openId: dados.openId,
    nome: dados.nome,
    email: dados.email,
  });

  return resultado;
}

// FUNÇÕES DE CONFIGURAÇÃO SMTP 

export async function obterConfigSMTP(usuarioId: number) {
  const resultado = await db
    .select()
    .from(smtpConfigs)
    .where(eq(smtpConfigs.usuarioId, usuarioId))
    .limit(1);

  return resultado[0] || null;
}

export async function salvarConfigSMTP(
  usuarioId: number,
  dados: {
    smtpServer: string;
    smtpPort: number;
    username: string;
    password: string;
    emailDestino: string;
  }
) {
  const configExistente = await obterConfigSMTP(usuarioId);

  if (configExistente) {
    await db
      .update(smtpConfigs)
      .set(dados)
      .where(eq(smtpConfigs.usuarioId, usuarioId));
  } else {
    await db.insert(smtpConfigs).values({
      usuarioId,
      ...dados,
    });
  }
}

// FUNÇÕES DE MONITORAMENTOS 

export async function criarMonitoramento(
  usuarioId: number,
  dados: {
    symbol: string;
    buyPrice: string;
    sellPrice: string;
  }
) {
  const resultado = await db.insert(monitoramentos).values({
    usuarioId,
    ...dados,
  });

  return resultado;
}

export async function obterMonitoramentosDoUsuario(usuarioId: number) {
  return await db
    .select()
    .from(monitoramentos)
    .where(eq(monitoramentos.usuarioId, usuarioId));
}

export async function obterMonitoramentoAtivo(usuarioId: number) {
  const resultado = await db
    .select()
    .from(monitoramentos)
    .where(
      and(
        eq(monitoramentos.usuarioId, usuarioId),
        eq(monitoramentos.status, 'ativo')
      )
    )
    .limit(1);

  return resultado[0] || null;
}

export async function atualizarStatusMonitoramento(
  monitoramentoId: number,
  status: 'ativo' | 'parado'
) {
  await db
    .update(monitoramentos)
    .set({ status })
    .where(eq(monitoramentos.id, monitoramentoId));
}

export async function marcarAlertaEnviado(
  monitoramentoId: number,
  tipo: 'compra' | 'venda'
) {
  const campo = tipo === 'compra' ? 'buyAlertSent' : 'sellAlertSent';

  await db
    .update(monitoramentos)
    .set({ [campo]: true })
    .where(eq(monitoramentos.id, monitoramentoId));
}

export async function resetarAlertas(monitoramentoId: number) {
  await db
    .update(monitoramentos)
    .set({
      buyAlertSent: false,
      sellAlertSent: false,
    })
    .where(eq(monitoramentos.id, monitoramentoId));
}

// FUNÇÕES DE ALERTAS 

export async function registrarAlerta(dados: {
  monitoramentoId: number;
  tipo: 'compra' | 'venda';
  preco: string;
  limite: string;
}) {
  return await db.insert(alertas).values(dados);
}

export async function obterHistoricoAlertas(
  monitoramentoId: number,
  limite: number = 50
) {
  return await db
    .select()
    .from(alertas)
    .where(eq(alertas.monitoramentoId, monitoramentoId))
    .orderBy(desc(alertas.enviadoEm))
    .limit(limite);
}

// FUNÇÕES DE HISTÓRICO DE PREÇOS 

export async function registrarPreco(
  monitoramentoId: number,
  preco: string
) {
  return await db.insert(historicoPrecos).values({
    monitoramentoId,
    preco,
  });
}

export async function obterHistoricoPrecos(
  monitoramentoId: number,
  horas: number = 24
) {
  const dataLimite = new Date(Date.now() - horas * 60 * 60 * 1000);

  return await db
    .select()
    .from(historicoPrecos)
    .where(
      and(
        eq(historicoPrecos.monitoramentoId, monitoramentoId),
        // Comparar timestamps (simplificado)
      )
    )
    .orderBy(historicoPrecos.registradoEm);
}
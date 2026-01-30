// drizzle/schema.ts
import {
  int,
  varchar,
  decimal,
  boolean,
  datetime,
  mysqlTable,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';

// Tabela de usuários
export const usuarios = mysqlTable('usuarios', {
  id: int('id').primaryKey().autoincrement(),
  openId: varchar('openId', { length: 64 }).notNull().unique(),
  nome: varchar('nome', { length: 255 }),
  email: varchar('email', { length: 255 }),
  criadoEm: datetime('criadoEm').defaultNow(),
});

// Tabela de configurações SMTP
export const smtpConfigs = mysqlTable('smtpConfigs', {
  id: int('id').primaryKey().autoincrement(),
  usuarioId: int('usuarioId').notNull(),
  smtpServer: varchar('smtpServer', { length: 255 }).notNull(),
  smtpPort: int('smtpPort').notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(), // Criptografar em produção!
  emailDestino: varchar('emailDestino', { length: 255 }).notNull(),
  criadoEm: datetime('criadoEm').defaultNow(),
});

// Tabela de monitoramentos
export const monitoramentos = mysqlTable('monitoramentos', {
  id: int('id').primaryKey().autoincrement(),
  usuarioId: int('usuarioId').notNull(),
  symbol: varchar('symbol', { length: 20 }).notNull(),
  buyPrice: decimal('buyPrice', { precision: 10, scale: 2 }).notNull(),
  sellPrice: decimal('sellPrice', { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['ativo', 'parado']).default('ativo'),
  buyAlertSent: boolean('buyAlertSent').default(false),
  sellAlertSent: boolean('sellAlertSent').default(false),
  criadoEm: datetime('criadoEm').defaultNow(),
  atualizadoEm: datetime('atualizadoEm').defaultNow().onUpdateNow(),
});

// Tabela de alertas (histórico)
export const alertas = mysqlTable('alertas', {
  id: int('id').primaryKey().autoincrement(),
  monitoramentoId: int('monitoramentoId').notNull(),
  tipo: mysqlEnum('tipo', ['compra', 'venda']).notNull(),
  preco: decimal('preco', { precision: 10, scale: 2 }).notNull(),
  limite: decimal('limite', { precision: 10, scale: 2 }).notNull(),
  enviadoEm: datetime('enviadoEm').defaultNow(),
});

// Tabela de histórico de preços
export const historicoPrecos = mysqlTable('historicoPrecos', {
  id: int('id').primaryKey().autoincrement(),
  monitoramentoId: int('monitoramentoId').notNull(),
  preco: decimal('preco', { precision: 10, scale: 2 }).notNull(),
  registradoEm: datetime('registradoEm').defaultNow(),
});

// Tipos TypeScript
export type Usuario = typeof usuarios.$inferSelect;
export type Monitoramento = typeof monitoramentos.$inferSelect;
export type Alerta = typeof alertas.$inferSelect;
export type HistoricoPreco = typeof historicoPrecos.$inferSelect;
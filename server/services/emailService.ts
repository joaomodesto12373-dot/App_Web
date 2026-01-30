// server/services/emailService.ts
import nodemailer from 'nodemailer';

interface ConfigSMTP {
  smtpServer: string;
  smtpPort: number;
  username: string;
  password: string;
  emailDestino: string;
}

/**
 * Criar transportador SMTP
 */
function criarTransportador(config: ConfigSMTP) {
  return nodemailer.createTransport({
    host: config.smtpServer,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });
}

/**
 * Enviar alerta de compra
 */
export async function enviarAlertaCompra(
  config: ConfigSMTP,
  dados: {
    symbol: string;
    preco: number;
    limite: number;
  }
) {
  const transporter = criarTransportador(config);

  const html = `
    <div style="font-family: Arial, sans-serif; background: #0f1419; color: #e0e0e0; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ff1493;">Alerta de Compra!</h2>
      <p>O preço de <strong style="color: #00d9ff;">${dados.symbol}</strong> caiu para:</p>
      <h1 style="color: #ff1493; font-size: 32px;">R$ ${dados.preco.toFixed(2)}</h1>
      <p>Seu limite de compra era: <strong>R$ ${dados.limite.toFixed(2)}</strong></p>
      <p style="color: #999; font-size: 12px;">Hora: ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.username,
      to: config.emailDestino,
      subject: `Alerta de Compra - ${dados.symbol}`,
      html,
    });

    console.log(`E-mail de alerta de compra enviado para ${config.emailDestino}`);
    return true;
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro);
    throw new Error('Não foi possível enviar o e-mail');
  }
}

/**
 * Enviar alerta de venda
 */
export async function enviarAlertaVenda(
  config: ConfigSMTP,
  dados: {
    symbol: string;
    preco: number;
    limite: number;
  }
) {
  const transporter = criarTransportador(config);

  const html = `
    <div style="font-family: Arial, sans-serif; background: #0f1419; color: #e0e0e0; padding: 20px; border-radius: 8px;">
      <h2 style="color: #00d9ff;">Alerta de Venda!</h2>
      <p>O preço de <strong style="color: #ff1493;">${dados.symbol}</strong> subiu para:</p>
      <h1 style="color: #00d9ff; font-size: 32px;">R$ ${dados.preco.toFixed(2)}</h1>
      <p>Seu limite de venda era: <strong>R$ ${dados.limite.toFixed(2)}</strong></p>
      <p style="color: #999; font-size: 12px;">Hora: ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.username,
      to: config.emailDestino,
      subject: `Alerta de Venda - ${dados.symbol}`,
      html,
    });

    console.log(`E-mail de alerta de venda enviado para ${config.emailDestino}`);
    return true;
  } catch (erro) {
    console.error('Erro ao enviar e-mail:', erro);
    throw new Error('Não foi possível enviar o e-mail');
  }
}
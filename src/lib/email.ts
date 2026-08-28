import "server-only";

/**
 * Transactional email architecture.
 *
 * This module is the single integration point for outgoing email — order
 * confirmations, status updates, password resets, account creation, shipping
 * and delivery notifications. It is intentionally provider-agnostic: swap in
 * Resend, Postmark, SES, or plain SMTP by implementing `send()` below and
 * setting EMAIL_PROVIDER/EMAIL_API_KEY/EMAIL_FROM in your environment.
 * Nothing else in the app needs to change.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(message: EmailMessage): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER;

  if (!provider) {
    // No provider configured — log instead of failing so the rest of the
    // app (checkout, registration, etc.) keeps working in development.
    console.info(`[email:noop] to=${message.to} subject="${message.subject}"`);
    return;
  }

  throw new Error(
    `EMAIL_PROVIDER="${provider}" is set but not implemented. Add the provider's SDK/fetch call here in src/lib/email.ts.`
  );
}

export function orderConfirmationEmail(params: { customerName: string; orderNumber: string; grandTotalFormatted: string }): EmailMessage {
  return {
    to: "",
    subject: `Order Confirmed — ${params.orderNumber}`,
    html: `<p>Hi ${params.customerName},</p><p>Thank you for your order <strong>${params.orderNumber}</strong> (${params.grandTotalFormatted}). We'll notify you as it ships.</p>`,
  };
}

export function orderStatusUpdateEmail(params: { customerName: string; orderNumber: string; status: string }): EmailMessage {
  return {
    to: "",
    subject: `Order ${params.orderNumber} — ${params.status}`,
    html: `<p>Hi ${params.customerName},</p><p>Your order <strong>${params.orderNumber}</strong> status has been updated to <strong>${params.status}</strong>.</p>`,
  };
}

export function passwordResetEmail(params: { resetUrl: string }): EmailMessage {
  return {
    to: "",
    subject: "Reset your password",
    html: `<p>Click the link below to reset your password. This link expires in 60 minutes.</p><p><a href="${params.resetUrl}">${params.resetUrl}</a></p>`,
  };
}

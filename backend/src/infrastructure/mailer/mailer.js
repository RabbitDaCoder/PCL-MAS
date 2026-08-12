// Dev-only mailer: logs the email instead of sending it. Swap this implementation for a real
// provider (e.g. Nodemailer/SMTP) later — callers only depend on this function signature.
async function sendPasswordResetEmail({ to, resetUrl }) {
  console.log(`[DEV MAILER STUB] Password reset link for ${to}: ${resetUrl}`);
}

module.exports = { sendPasswordResetEmail };

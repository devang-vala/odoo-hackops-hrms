import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
  },
});

/**
 * Send employee credentials email
 */
export async function sendEmployeeCredentials(employeeData) {
  const { name, email, employeeId, tempPassword, companyName } = employeeData;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your HRMS Account Credentials`,
    html: `
<!DOCTYPE html>
<html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, sans-serif;
        background-color: #ffffff;
        color: #111827;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
      }
      .header {
        padding: 24px;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
      }
      .header h1 {
        font-size: 20px;
        font-weight: 600;
      }
      .content {
        padding: 24px;
      }
      .greeting {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      .message {
        font-size: 14px;
        color: #374151;
        margin-bottom: 20px;
      }
      .credentials-box {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .credential-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 4px;
      }
      .credential-value {
        font-size: 14px;
        font-weight: 600;
        font-family: monospace;
        color: #111827;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        border-radius: 4px;
        margin-bottom: 12px;
        display: inline-block;
      }
      .warning-box {
        border: 1px solid #e5e7eb;
        padding: 12px;
        font-size: 13px;
        color: #374151;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        padding: 12px 28px;
        border: 1px solid #111827;
        background: #ffffff;
        color: #111827;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
      }
      .footer {
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Human Resource Management System</h1>
      </div>

      <div class="content">
        <div class="greeting">Hello ${name},</div>

        <p class="message">
          Your employee account has been created in the Human Resource Management System.
          Please find your login credentials below.
        </p>

        <div class="credentials-box">
          <div class="credential-label">Employee ID</div>
          <div class="credential-value">${employeeId}</div>

          <div class="credential-label">Email</div>
          <div class="credential-value">${email}</div>

          <div class="credential-label">Temporary Password</div>
          <div class="credential-value">${tempPassword}</div>
        </div>

        <div class="warning-box">
          For security reasons, you must change your password after your first login.
        </div>

        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth" class="button">
            Login to HRMS
          </a>
        </center>
      </div>

      <div class="footer">
        <p>${companyName || "Human Resource Management System"}</p>
        <p>© ${new Date().getFullYear()} All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetUrl) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password - HRMS",
    html: `
<!DOCTYPE html>
<html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: Arial, sans-serif;
        background-color: #ffffff;
        color: #111827;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
      }
      .header {
        padding: 24px;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
      }
      .header h1 {
        font-size: 20px;
        font-weight: 600;
      }
      .content {
        padding: 24px;
      }
      .message {
        font-size: 14px;
        color: #374151;
        margin-bottom: 20px;
      }
      .button {
        display: inline-block;
        padding: 12px 28px;
        border: 1px solid #111827;
        background: #ffffff;
        color: #111827;
        text-decoration: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
      }
      .warning-box {
        border: 1px solid #e5e7eb;
        padding: 12px;
        font-size: 13px;
        color: #374151;
        margin: 20px 0;
      }
      .footer {
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Human Resource Management System</h1>
      </div>

      <div class="content">
        <p class="message">
          A request was received to reset your password. Click the button below to proceed.
        </p>

        <center>
          <a href="${resetUrl}" class="button">
            Reset Password
          </a>
        </center>

        <div class="warning-box">
          This password reset link will expire in 1 hour.
        </div>

        <p class="message" style="font-size: 13px; color: #6b7280;">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} Human Resource Management System</p>
      </div>
    </div>
  </body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(to) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Test Email - HRMS",
    html: `
<div style="font-family: Arial, sans-serif; padding: 20px; background: #ffffff; color: #111827;">
  <h2>Email Configuration Successful</h2>
  <p>If you received this email, your email service is working correctly.</p>
</div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Test email error:", error);
    return { success: false, error: error.message };
  }
}

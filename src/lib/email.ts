import nodemailer from 'nodemailer';

interface WelcomeEmailParams {
  to: string;
  name?: string;
  credits?: number;
  plan?: string;
}

export async function sendWelcomeEmail({
  to,
  name,
  credits = 100,
  plan = 'Free Trial',
}: WelcomeEmailParams) {
  const displayName = name || to.split('@')[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'kobx2.2005@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  const subject = `🎉 ຍິນດີຕ້ອນຮັບສູ່ SAIZUP AI Studio! Welcome to SAIZUP AI, ${displayName}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="lo">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SAIZUP AI</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0c13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; background-color: #12141f; border-radius: 20px; overflow: hidden; border: 1px solid #232738; }
    .header { background: linear-gradient(135deg, #090c14 0%, #161a29 100%); padding: 36px 30px; text-align: center; border-bottom: 2px solid #12E8FF; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 54px; height: 54px; border-radius: 16px; background: linear-gradient(135deg, #12E8FF, #5B8FFF); box-shadow: 0 8px 24px rgba(18, 232, 255, 0.35); margin-bottom: 16px; font-weight: 900; color: #090c14; font-size: 24px; }
    .brand-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0; }
    .brand-accent { color: #12E8FF; }
    .content { padding: 32px 30px; }
    .greeting { font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 8px; }
    .subgreeting { font-size: 14px; color: #94a3b8; margin-top: 0; margin-bottom: 24px; line-height: 1.5; }
    .card { background: #1a1d2c; border: 1px solid #2a2f45; border-radius: 14px; padding: 20px; margin-bottom: 24px; }
    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #252a3f; font-size: 13px; }
    .stat-row:last-child { border-bottom: none; }
    .stat-label { color: #94a3b8; }
    .stat-value { font-weight: 700; color: #12E8FF; font-family: monospace; }
    .section-title { font-size: 15px; font-weight: 800; color: #12E8FF; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .feature-item { padding: 12px 14px; background: #171926; border-left: 3px solid #12E8FF; border-radius: 8px; margin-bottom: 10px; font-size: 13px; line-height: 1.5; }
    .feature-item strong { color: #ffffff; display: block; margin-bottom: 4px; font-size: 14px; }
    .feature-item span.en { color: #94a3b8; font-size: 12px; display: block; margin-top: 2px; }
    .cta-btn { display: block; text-align: center; background: linear-gradient(90deg, #12E8FF, #00b4d8); color: #090c14 !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 15px 24px; border-radius: 12px; margin: 28px 0; box-shadow: 0 8px 20px rgba(18, 232, 255, 0.3); }
    .footer { background: #0c0d14; padding: 24px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e2233; line-height: 1.6; }
    .footer a { color: #12E8FF; text-decoration: none; }
  </style>
</head>
<body>
  <div style="padding: 20px 10px;">
    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <div class="logo-badge">SZ</div>
        <h1 class="brand-title">SAIZUP <span class="brand-accent">AI</span></h1>
        <p style="margin: 6px 0 0; color: #94a3b8; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Next-Gen Short Video & Subtitle Studio</p>
      </div>

      <!-- BODY CONTENT -->
      <div class="content">
        <h2 class="greeting">ສະບາຍດີ, ຍິນດີຕ້ອນຮັບສູ່ SAIZUP AI! 🎉</h2>
        <p class="subgreeting">
          Welcome to SAIZUP AI Studio, <strong>${displayName}</strong>! ບັນຊີຂອງທ່ານໄດ້ຮັບການເຊື່ອມຕໍ່ ແລະ ພ້ອມໃຊ້ງານລະບົບຕັດຕໍ່ວິດີໂອສັ້ນ ແລະ ສ້າງຊັບໄຕເຕິ້ນອັດຕະໂນມັດແລ້ວ.
        </p>

        <!-- ACCOUNT INFO CARD -->
        <div class="card">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #ffffff;">📋 ລາຍລະອຽດບັນຊີຂອງທ່ານ (Account Details)</div>
          <div class="stat-row">
            <span class="stat-label">ອີເມວ (Email):</span>
            <span class="stat-value" style="color: #ffffff;">${to}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">ແພັກເກດ (Plan):</span>
            <span class="stat-value">${plan}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">ເຄຣດິດຟຣີ (Initial Credits):</span>
            <span class="stat-value">${credits} Credits</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">ສະຖານະ (Status):</span>
            <span class="stat-value" style="color: #4ade80;">Active / ພ້ອມໃຊ້ງານ</span>
          </div>
        </div>

        <!-- FEATURES & TIPS (LAO + ENGLISH) -->
        <div class="section-title">✨ ສິ່ງທີ່ທ່ານສາມາດເຮັດໄດ້ໃນ SAIZUP AI:</div>

        <div class="feature-item">
          <strong>1. ຖອດສຽງເວົ້າ ແລະ ໃສ່ຊັບອັດຕະໂນມັດ (AI Auto Captions)</strong>
          ຖອດສຽງເວົ້າພາສາລາວ ແລະ ໄທ ພ້ອມສັບອັງກິດດ້ວຍ Gemini AI ທີ່ມີຄວາມຖືກຕ້ອງສູງ ແລະ ຈັດວາງເວລາ Playhead ຢ່າງຊັດເຈນ.
          <span class="en">Automatic speech-to-text with mixed Lao and English loanword recognition powered by Gemini AI.</span>
        </div>

        <div class="feature-item">
          <strong>2. ໄທມ໌ໄລນ໌ຕັດຕໍ່ແບບມືອາຊີບ (CapCut-Style Multi-Track Editor)</strong>
          ຕັດແຍກຄລິບ (Split: ຄີລັດ B), ຕັດຫົວ-ທ້າຍຄລິບ (Trim: Q / W), ແລະ ລາກວາງຄລິບລົງແທຣັກໄທມ໌ໄລນ໌ໄດ້ສະດວກ.
          <span class="en">Multi-track timeline with standard video editing shortcuts (Split B, Trim Q/W, Delete Del).</span>
        </div>

        <div class="feature-item">
          <strong>3. ຂອບເຂດປອດໄພໂຊຊຽວມີເດຍ (Social Media Safe Zones)</strong>
          ຮອງຮັບໄກດ໌ລາຍ TikTok, Instagram Reels, ແລະ Facebook Reels ເພື່ອບໍ່ໃຫ້ຕົວໜັງສືຊັບໄຕເຕິ້ນຖືກບັງດ້ວຍປຸ່ມກົດໃຈ ຫຼື ແຄບຊັນ.
          <span class="en">Built-in visual safe zones for TikTok, Reels, and YouTube Shorts preventing subtitle clipping.</span>
        </div>

        <div class="feature-item">
          <strong>4. ຮູບແບບຊັບໄຕເຕິ້ນ ແລະ ຄາລາໂອເກະ (Dynamic Subtitle Styles)</strong>
          ເລືອກຮູບແບບແບບ CapCut & LaoSub: ນີອອນ (Neon), ເດັ້ງທີລະຄຳ (Word Bounce), ໄລ່ສີຄາລາໂອເກະ, ແລະ ຕົວອັກສອນພາສາລາວທີ່ຄົມຊັດ.
          <span class="en">Trending subtitle presets: neon glow, word bounce animations, and karaoke highlight effects.</span>
        </div>

        <!-- CALL TO ACTION BUTTON -->
        <a href="${appUrl}/editor" class="cta-btn">
          🚀 ເປີດໃຊ້ງານ Video Studio ທັນທີ (Launch Studio Now)
        </a>

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          ຫາກທ່ານມີຄຳຖາມ ຫຼື ຕ້ອງການຄວາມຊ່ວຍເຫຼືອ ສາມາດຕິດຕໍ່ທີມງານໄດ້ຕະຫຼອດເວລາ.<br>
          <span style="font-size: 11px; color: #64748b;">If you need assistance, please feel free to reach out to our team anytime.</span>
        </p>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p style="margin: 0 0 6px;"><strong>SAIZUP AI Studio</strong> • Vientiane, Lao PDR</p>
        <p style="margin: 0 0 8px;">Email Support: <a href="mailto:kobx2.2005@gmail.com">kobx2.2005@gmail.com</a></p>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          © ${new Date().getFullYear()} SAIZUP AI. All rights reserved. ລະບົບສ້າງຊັບໄຕເຕິ້ນວິດີໂອສັ້ນອັດສະລິຍະ.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // If SMTP password is configured, send the real email via Gmail SMTP
  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"SAIZUP AI Studio" <${smtpUser}>`,
        to,
        subject,
        html: htmlContent,
      });

      console.log(`[EMAIL] Real Welcome email delivered to ${to} (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId, delivered: true };
    } catch (err: any) {
      console.error(`[EMAIL ERROR] Failed to send email via SMTP to ${to}:`, err);
      // Fallback: don't crash, return graceful success status
      return { success: false, error: err.message, delivered: false };
    }
  } else {
    // If SMTP_PASS is not set yet, log the welcome email and instruct developer
    console.log(`[EMAIL SIMULATED] Welcome email prepared for ${to} (${subject})`);
    console.log(`[EMAIL NOTICE] To send live emails to inboxes, add SMTP_PASS (Gmail App Password) in .env.local`);
    return { success: true, simulated: true, delivered: false };
  }
}

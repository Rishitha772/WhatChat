package app.whatchat.mail;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String buildVerificationEmail(String recipientName, String verificationUrl) {
        String displayName = (recipientName != null && !recipientName.isBlank()) ? recipientName.trim() : "there";
        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify your WhatChat email address</title>
              <style>
                body { margin: 0; padding: 0; background-color: #f8f5fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292333; }
                .email-wrapper { width: 100%; max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #eae5f1; overflow: hidden; box-shadow: 0 4px 20px rgba(128, 100, 181, 0.08); }
                .header-bar { background: linear-gradient(135deg, #160628 0%, #2f114d 50%, #4c166f 100%); padding: 32px 30px; text-align: center; }
                .brand-title { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
                .content-box { padding: 36px 32px; }
                .greeting { font-size: 18px; font-weight: 650; color: #1a0f2e; margin: 0 0 16px; }
                .copy-text { font-size: 14.5px; line-height: 1.65; color: #524b5d; margin: 0 0 20px; }
                .btn-container { text-align: center; margin: 32px 0; }
                .verify-button { display: inline-block; background-color: #8064b5; background-image: linear-gradient(135deg, #6929c4 0%, #7e3af2 100%); color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(105, 41, 196, 0.28); }
                .link-fallback { background: #faf8fc; border: 1px solid #ece4f5; border-radius: 10px; padding: 14px; font-size: 12.5px; color: #777181; word-break: break-all; margin-top: 24px; }
                .link-fallback a { color: #7050a6; text-decoration: underline; }
                .expiry-note { font-size: 12.5px; color: #888094; margin-top: 16px; font-style: italic; }
                .footer { border-top: 1px solid #eae5f1; padding: 20px 32px; background-color: #faf8fc; text-align: center; font-size: 12px; color: #9994a1; }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="header-bar">
                  <h1 class="brand-title">💬 WhatChat</h1>
                </div>
                <div class="content-box">
                  <h2 class="greeting">Hi {{NAME}},</h2>
                  <p class="copy-text">
                    Welcome to <strong>WhatChat</strong> — a modern, private space for your conversations and cherished memories.
                  </p>
                  <p class="copy-text">
                    To activate your account and verify your email address, please click the button below:
                  </p>
                  <div class="btn-container">
                    <a href="{{URL}}" class="verify-button" target="_blank" rel="noopener noreferrer">Verify Email Address &rarr;</a>
                  </div>
                  <p class="expiry-note">
                    ⏳ This verification link expires in <strong>24 hours</strong>.
                  </p>
                  <div class="link-fallback">
                    If the button doesn't work, copy and paste this secure link into your browser:<br>
                    <a href="{{URL}}" target="_blank" rel="noopener noreferrer">{{URL}}</a>
                  </div>
                  <p class="copy-text" style="margin-top: 24px; font-size: 12.5px; color: #888094;">
                    If you didn't create a WhatChat account, please ignore this email. No account will be activated without verification.
                  </p>
                </div>
                <div class="footer">
                  &copy; 2026 WhatChat. Built with security and privacy.
                </div>
              </div>
            </body>
            </html>
            """;
        return template.replace("{{NAME}}", displayName).replace("{{URL}}", verificationUrl);
    }

    public String buildPasswordResetEmail(String recipientName, String resetUrl) {
        String displayName = (recipientName != null && !recipientName.isBlank()) ? recipientName.trim() : "there";
        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your WhatChat password</title>
              <style>
                body { margin: 0; padding: 0; background-color: #f8f5fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #292333; }
                .email-wrapper { width: 100%; max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #eae5f1; overflow: hidden; box-shadow: 0 4px 20px rgba(128, 100, 181, 0.08); }
                .header-bar { background: linear-gradient(135deg, #160628 0%, #2f114d 50%, #4c166f 100%); padding: 32px 30px; text-align: center; }
                .brand-title { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
                .content-box { padding: 36px 32px; }
                .greeting { font-size: 18px; font-weight: 650; color: #1a0f2e; margin: 0 0 16px; }
                .copy-text { font-size: 14.5px; line-height: 1.65; color: #524b5d; margin: 0 0 20px; }
                .btn-container { text-align: center; margin: 32px 0; }
                .reset-button { display: inline-block; background-color: #8064b5; background-image: linear-gradient(135deg, #6929c4 0%, #7e3af2 100%); color: #ffffff !important; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(105, 41, 196, 0.28); }
                .link-fallback { background: #faf8fc; border: 1px solid #ece4f5; border-radius: 10px; padding: 14px; font-size: 12.5px; color: #777181; word-break: break-all; margin-top: 24px; }
                .link-fallback a { color: #7050a6; text-decoration: underline; }
                .expiry-note { font-size: 12.5px; color: #888094; margin-top: 16px; font-style: italic; }
                .footer { border-top: 1px solid #eae5f1; padding: 20px 32px; background-color: #faf8fc; text-align: center; font-size: 12px; color: #9994a1; }
              </style>
            </head>
            <body>
              <div class="email-wrapper">
                <div class="header-bar">
                  <h1 class="brand-title">💬 WhatChat</h1>
                </div>
                <div class="content-box">
                  <h2 class="greeting">Hi {{NAME}},</h2>
                  <p class="copy-text">
                    We received a request to reset your password for your <strong>WhatChat</strong> account.
                  </p>
                  <p class="copy-text">
                    Click the button below to choose a new password:
                  </p>
                  <div class="btn-container">
                    <a href="{{URL}}" class="reset-button" target="_blank" rel="noopener noreferrer">Reset Password &rarr;</a>
                  </div>
                  <p class="expiry-note">
                    ⏳ This password reset link expires in <strong>30 minutes</strong>.
                  </p>
                  <div class="link-fallback">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="{{URL}}" target="_blank" rel="noopener noreferrer">{{URL}}</a>
                  </div>
                  <p class="copy-text" style="margin-top: 24px; font-size: 12.5px; color: #888094;">
                    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
                  </p>
                </div>
                <div class="footer">
                  &copy; 2026 WhatChat. Built with security and privacy.
                </div>
              </div>
            </body>
            </html>
            """;
        return template.replace("{{NAME}}", displayName).replace("{{URL}}", resetUrl);
    }
}

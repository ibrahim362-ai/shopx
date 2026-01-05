const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.isConfigured = this.checkConfiguration();
    
    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn('⚠️  Email service not configured. Email functionality will be disabled.');
    }
  }

  checkConfiguration() {
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL', 'FROM_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn(`⚠️  Missing email configuration: ${missingVars.join(', ')}`);
      return false;
    }
    
    return true;
  }

  async sendReplyEmail(customerEmail, customerName, originalMessage, replyContent, adminName) {
    if (!this.isConfigured) {
      return { 
        success: false, 
        error: 'Email service is not configured. Please set up SMTP settings in environment variables.' 
      };
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: customerEmail,
      subject: 'Re: Your Message to Our Support Team',
      html: this.generateReplyEmailTemplate(customerName, originalMessage, replyContent, adminName),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Reply email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending reply email:', error);
      return { success: false, error: error.message };
    }
  }

  generateReplyEmailTemplate(customerName, originalMessage, replyContent, adminName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reply from ${process.env.FROM_NAME}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .reply-content { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .original-message { background: #f5f5f5; padding: 15px; border-left: 4px solid #ddd; margin: 20px 0; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Hello ${customerName},</h2>
            <p>Thank you for contacting us. We've received your message and here's our response:</p>
          </div>
          
          <div class="reply-content">
            <h3>Our Response:</h3>
            <p>${replyContent.replace(/\n/g, '<br>')}</p>
            <p><strong>- ${adminName}</strong><br>
            ${process.env.FROM_NAME} Support Team</p>
          </div>
          
          <div class="original-message">
            <h4>Your Original Message:</h4>
            <p>${originalMessage.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div class="footer">
            <p>If you have any further questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>
            ${process.env.FROM_NAME} Support Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    if (!this.isConfigured) {
      return false;
    }
    
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
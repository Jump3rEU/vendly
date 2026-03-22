// Email Service using Resend
// Centralized email sending for all notifications

import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@vendly.cz'
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not configured. Email skipped:', subject)
    return { success: false, error: 'Email not configured' }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })

    console.log('✅ Email sent:', subject, 'to', to)
    return { success: true, data }
  } catch (error: any) {
    console.error('❌ Email failed:', subject, error)
    return { success: false, error: error.message }
  }
}

// ==============================================
// ORDER EMAILS
// ==============================================

export async function sendOrderConfirmationEmail(data: {
  buyerEmail: string
  buyerName: string
  orderId: string
  listingTitle: string
  price: number
  sellerName: string
}) {
  const { buyerEmail, buyerName, orderId, listingTitle, price, sellerName } = data

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .order-box { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .highlight { font-weight: bold; color: #0ea5e9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Objednávka potvrzena!</h1>
          </div>
          <div class="content">
            <p>Ahoj <strong>${buyerName}</strong>,</p>
            
            <p>Děkujeme za nákup na Vendly! Tvoje objednávka byla úspěšně vytvořena.</p>

            <div class="order-box">
              <h3 style="margin-top: 0;">📦 Detaily objednávky</h3>
              <p><strong>Číslo objednávky:</strong> ${orderId}</p>
              <p><strong>Produkt:</strong> ${listingTitle}</p>
              <p><strong>Cena:</strong> ${price.toLocaleString('cs-CZ')} Kč</p>
              <p><strong>Prodávající:</strong> ${sellerName}</p>
            </div>

            <h3>💰 Escrow ochrana</h3>
            <p>Tvoje peníze jsou bezpečně uloženy v našem escrow systému. Prodávající je obdrží až po potvrzení, že jsi obdržel(a) zboží v pořádku.</p>

            <h3>📬 Co dál?</h3>
            <ol>
              <li>Prodávající připraví a odešle zboží</li>
              <li>Po doručení zboží potvrď přijetí</li>
              <li>Peníze budou automaticky uvolněny prodávajícímu</li>
            </ol>

            <a href="${APP_URL}/objednavky/${orderId}" class="button">Zobrazit objednávku</a>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Máš dotaz? Odpověz na tento email nebo nás kontaktuj přes zprávy na webu.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 Vendly - Bezpečný lokální prodej</p>
            <p>
              <a href="${APP_URL}/pravni/obchodni-podminky">Obchodní podmínky</a> • 
              <a href="${APP_URL}/pravni/ochrana-osobnich-udaju">Ochrana osobních údajů</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: buyerEmail,
    subject: `✅ Objednávka ${orderId} - ${listingTitle}`,
    html,
  })
}

export async function sendOrderShippedEmail(data: {
  buyerEmail: string
  buyerName: string
  orderId: string
  listingTitle: string
  trackingNumber?: string
  carrier?: string
}) {
  const { buyerEmail, buyerName, orderId, listingTitle, trackingNumber, carrier } = data

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .tracking-box { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
          .button { display: inline-block; background: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📦 Zásilka odesláná!</h1>
          </div>
          <div class="content">
            <p>Ahoj <strong>${buyerName}</strong>,</p>
            
            <p>Skvělé zprávy! Tvoje objednávka byla odeslána a je na cestě.</p>

            <div class="tracking-box">
              <h3 style="margin-top: 0;">🚚 Informace o zásilce</h3>
              <p><strong>Objednávka:</strong> ${listingTitle}</p>
              ${trackingNumber ? `<p><strong>Tracking číslo:</strong> ${trackingNumber}</p>` : ''}
              ${carrier ? `<p><strong>Dopravce:</strong> ${carrier}</p>` : ''}
            </div>

            <h3>✅ Po přijetí zboží</h3>
            <p>Po doručení prosím potvrď, že jsi zboží obdržel(a) a je vše v pořádku. Potom budou automaticky uvolněny peníze prodávajícímu.</p>

            <a href="${APP_URL}/objednavky/${orderId}" class="button">Potvrdit přijetí</a>
          </div>
          <div class="footer">
            <p>© 2026 Vendly - Bezpečný lokální prodej</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: buyerEmail,
    subject: `📦 Zásilka odeslána - ${listingTitle}`,
    html,
  })
}

export async function sendOrderCompletedEmail(data: {
  sellerEmail: string
  sellerName: string
  orderId: string
  listingTitle: string
  amount: number
}) {
  const { sellerEmail, sellerName, orderId, listingTitle, amount } = data

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .money-box { background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #8b5cf6; }
          .amount { font-size: 32px; font-weight: bold; color: #8b5cf6; margin: 10px 0; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Gratulujeme k prodeji!</h1>
          </div>
          <div class="content">
            <p>Ahoj <strong>${sellerName}</strong>,</p>
            
            <p>Kupující potvrdil přijetí zboží. Peníze byly uvolněny z escrow systému!</p>

            <div class="money-box">
              <h3 style="margin-top: 0;">💰 Obdržená platba</h3>
              <p><strong>${listingTitle}</strong></p>
              <div class="amount">${amount.toLocaleString('cs-CZ')} Kč</div>
              <p style="color: #6b7280; font-size: 14px;">Po odečtení 5% poplatku platformy</p>
            </div>

            <p>Peníze jsou na cestě na tvůj účet. Obvykle to trvá 2-3 pracovní dny.</p>

            <a href="${APP_URL}/objednavky/${orderId}" class="button">Zobrazit objednávku</a>

            <p style="margin-top: 30px;">Díky za používání Vendly! 🚀</p>
          </div>
          <div class="footer">
            <p>© 2026 Vendly - Bezpečný lokální prodej</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: sellerEmail,
    subject: `💰 Platba přijata - ${listingTitle}`,
    html,
  })
}

// ==============================================
// MESSAGE EMAILS
// ==============================================

export async function sendNewMessageEmail(data: {
  recipientEmail: string
  recipientName: string
  senderName: string
  messagePreview: string
  conversationId: string
}) {
  const { recipientEmail, recipientName, senderName, messagePreview, conversationId } = data

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .message-box { background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">💬 Nová zpráva</h1>
          </div>
          <div class="content">
            <p>Ahoj <strong>${recipientName}</strong>,</p>
            
            <p>Máš novou zprávu od <strong>${senderName}</strong>:</p>

            <div class="message-box">
              <p style="margin: 0;">${messagePreview.substring(0, 200)}${messagePreview.length > 200 ? '...' : ''}</p>
            </div>

            <a href="${APP_URL}/zpravy/${conversationId}" class="button">Odpovědět</a>
          </div>
          <div class="footer">
            <p>© 2026 Vendly - Bezpečný lokální prodej</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: recipientEmail,
    subject: `💬 Nová zpráva od ${senderName}`,
    html,
  })
}

// ==============================================
// AUTH EMAILS
// ==============================================

export async function sendPasswordResetEmail(data: {
  email: string
  name: string
  resetToken: string
}) {
  const { email, name, resetToken } = data

  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🔐 Reset hesla</h1>
          </div>
          <div class="content">
            <p>Ahoj <strong>${name}</strong>,</p>
            
            <p>Obdrželi jsme žádost o reset tvého hesla. Klikni na tlačítko níže a nastav si nové heslo:</p>

            <a href="${resetUrl}" class="button">Nastavit nové heslo</a>

            <p style="color: #6b7280; font-size: 14px;">Nebo zkopíruj tento odkaz do prohlížeče:<br>${resetUrl}</p>

            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Bezpečnostní upozornění:</strong></p>
              <ul style="margin: 10px 0;">
                <li>Tento odkaz je platný pouze 1 hodinu</li>
                <li>Pokud jsi o reset nežádal(a), ignoruj tento email</li>
                <li>Nikdy nesdílej tento odkaz s nikým jiným</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>© 2026 Vendly - Bezpečný lokální prodej</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '🔐 Reset hesla - Vendly',
    html,
  })
}

export async function sendWelcomeEmail(data: {
  email: string
  name: string
}) {
  const { email, name } = data

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .feature-box { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎉 Vítej na Vendly!</h1>
          </div>
          <div class="content">
            <p>Ahoj <strong>${name}</strong>,</p>
            
            <p>Jsme rádi, že jsi tu! Tvůj účet byl úspěšně vytvořen.</p>

            <h3>🚀 Co můžeš dělat na Vendly?</h3>
            
            <div class="feature-box">
              <strong>🛒 Nakupovat bezpečně</strong><br>
              Escrow ochrana zajistí, že tvoje peníze jsou v bezpečí
            </div>

            <div class="feature-box">
              <strong>💰 Prodávat snadno</strong><br>
              Vytvářej inzeráty za pár minut
            </div>

            <div class="feature-box">
              <strong>💬 Komunikovat přímo</strong><br>
              Domluvte se s prodávajícími přes zprávy
            </div>

            <a href="${APP_URL}/inzeraty" class="button">Začít procházet</a>

            <p style="margin-top: 30px;">Těšíme se na tvůj první úspěšný obchod! 🎯</p>
          </div>
          <div class="footer">
            <p>© 2026 Vendly - Bezpečný lokální prodej</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '🎉 Vítej na Vendly!',
    html,
  })
}

// ==============================================
// REMINDER EMAILS
// ==============================================

export async function sendConfirmDeliveryReminderEmail(data: {
  buyerEmail: string
  buyerName: string
  orderId: string
  listingTitle: string
  daysLeft: number
}) {
  const { buyerEmail, buyerName, orderId, listingTitle, daysLeft } = data

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .reminder-box { background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #f59e0b; }
          .days { font-size: 48px; font-weight: bold; color: #f59e0b; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">⏰ Připomínka</h1>
          </div>
          <div class="content">
            <p>Ahoj <strong>${buyerName}</strong>,</p>
            
            <p>Nezapomněli jste potvrdit přijetí zboží?</p>

            <div class="reminder-box">
              <p><strong>${listingTitle}</strong></p>
              <div class="days">${daysLeft}</div>
              <p style="margin: 5px 0;">dní do automatického uvolnění peněz</p>
            </div>

            <p>Pokud jsi zboží obdržel(a) a je vše v pořádku, prosím potvrď přijetí. Pokud ne, kontaktuj podporu.</p>

            <a href="${APP_URL}/objednavky/${orderId}" class="button">Potvrdit přijetí</a>
          </div>
          <div class="footer">
            <p>© 2026 Vendly - Bezpečný lokální prodej</p>
          </div>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: buyerEmail,
    subject: `⏰ Nezapomeň potvrdit přijetí - ${listingTitle}`,
    html,
  })
}

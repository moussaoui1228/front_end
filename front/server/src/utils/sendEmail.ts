import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;
let testAccountInfo: { user: string; pass: string } | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
    if (transporter) return transporter;

    const hasRealCredentials =
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASS;

    if (hasRealCredentials) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_PORT) || 465,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log('[MAIL] Using real SMTP credentials:', process.env.EMAIL_USER);
    } else {
        // Auto-create an Ethereal test account — emails are viewable in browser
        const testAccount = await nodemailer.createTestAccount();
        testAccountInfo = { user: testAccount.user, pass: testAccount.pass };
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log('\n📧 [MAIL] Mode TEST activé (Ethereal Email)');
        console.log(`   Compte de test: ${testAccount.user}`);
        console.log('   Les emails seront visibles via un lien dans le terminal.\n');

        if (process.env.NODE_ENV === 'production') {
            console.error('\n❌ AVERTISSEMENT CRITIQUE: Vous êtes en production mais vous utilisez le compte de test Ethereal. Les emails de réinitialisation ne parviendront pas aux vrais utilisateurs. Veuillez configurer EMAIL_USER et EMAIL_PASS dans votre fichier .env de production.\n');
        }
    }

    return transporter;
}

export const sendResetEmail = async (email: string, code: string) => {
    console.log(`[MAIL] Envoi du code de réinitialisation à: ${email}...`);
    const transport = await getTransporter();

    const mailOptions = {
        from: '"TAZDAYTH" <reset@tazdayth.com>',
        to: email,
        subject: 'Réinitialisation de votre mot de passe - TAZDAYTH',
        text: `Votre code de vérification pour réinitialiser votre mot de passe est : ${code}. Il expire dans 15 minutes.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4a5568;">Réinitialisation de mot de passe</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>TAZDAYTH</strong>.</p>
                <div style="background-color: #f7fafc; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2d3748;">${code}</span>
                </div>
                <p>Ce code est valable pendant <strong>15 minutes</strong>.</p>
                <p style="font-size: 0.8em; color: #a0aec0;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; font-weight: bold; color: #2d3748;">TAZDAYTH</p>
            </div>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(email, info);
    } catch (error: any) {
        console.error(`[MAIL] Échec d'envoi reset:`, error.message);
        throw error;
    }
};

export const sendOrderConfirmationEmail = async (email: string, orderData: { tracking_code: string; total_price: number; items: any[] }) => {
    console.log(`[MAIL] Envoi de la confirmation de commande à: ${email}...`);
    const transport = await getTransporter();

    const mailOptions = {
        from: '"TAZDAYTH" <orders@tazdayth.com>',
        to: email,
        subject: `Confirmation de votre commande #${orderData.tracking_code} - TAZDAYTH`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2D3748; text-align: center;">Merci pour votre commande !</h2>
                <p>Votre commande a été reçue avec succès chez <strong>TAZDAYTH</strong>.</p>
                
                <div style="background-color: #F7FAFC; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #E2E8F0;">
                    <p style="margin: 0; color: #718096; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Code de suivi</p>
                    <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #2D3748; letter-spacing: 2px;">${orderData.tracking_code}</p>
                </div>

                <div style="margin: 20px 0;">
                    <h3 style="color: #4A5568; border-bottom: 1px solid #EDF2F7; padding-bottom: 10px;">Récapitulatif</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        ${orderData.items.map(item => `
                            <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #F7FAFC;">
                                    <strong>${item.name}</strong><br/>
                                    <span style="color: #718096; font-size: 12px;">${item.quantity}L × ${item.price} DA</span>
                                </td>
                                <td style="text-align: right; padding: 10px 0; border-bottom: 1px solid #F7FAFC; font-weight: bold;">
                                    ${item.subtotal} DA
                                </td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td style="padding: 20px 0 10px 0; font-weight: bold; font-size: 18px;">TOTAL</td>
                            <td style="text-align: right; padding: 20px 0 10px 0; font-weight: bold; font-size: 24px; color: #2D3748;">
                                ${orderData.total_price} DA
                            </td>
                        </tr>
                    </table>
                </div>

                <p style="font-size: 14px; color: #4A5568; background: #FFF5F5; padding: 15px; border-radius: 8px; border-left: 4px solid #F56565;">
                    <strong>IMPORTANT :</strong> Veuillez montrer ce code lors de la récupération de votre commande à l'huilerie.
                </p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="text-align: center; font-weight: bold; color: #2D3748;">TAZDAYTH</p>
            </div>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(email, info);
    } catch (error: any) {
        console.error(`[MAIL] Échec d'envoi confirmation commande:`, error.message);
    }
};

export const sendPressingConfirmationEmail = async (email: string, pressingData: { tracking_code: string; quantity: number; quality: string }) => {
    console.log(`[MAIL] Envoi de la confirmation de pressage à: ${email}...`);
    const transport = await getTransporter();

    const mailOptions = {
        from: '"TAZDAYTH" <pressing@tazdayth.com>',
        to: email,
        subject: `Confirmation de votre demande de pressage #${pressingData.tracking_code} - TAZDAYTH`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2D3748; text-align: center;">Demande de pressage confirmée</h2>
                <p>Votre demande de pressage pour <strong>${pressingData.quantity} kg</strong> d'olives a été enregistrée.</p>
                
                <div style="background-color: #F7FAFC; padding: 20px; border-radius: 10px; margin: 20px 0; border: 1px solid #E2E8F0;">
                    <p style="margin: 0; color: #718096; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Code de suivi</p>
                    <p style="margin: 5px 0 0 0; font-size: 32px; font-weight: bold; color: #2D3748; letter-spacing: 2px;">${pressingData.tracking_code}</p>
                </div>

                <p><strong>Qualité d'huile souhaitée :</strong> ${pressingData.quality.replace('_', ' ')}</p>

                <p style="font-size: 14px; color: #4A5568; background: #FFF5F5; padding: 15px; border-radius: 8px; border-left: 4px solid #F56565;">
                    <strong>IMPORTANT :</strong> Veuillez présenter ce code lors de l'apport de vos olives à l'huilerie.
                </p>

                <p>Vous recevrez une nouvelle notification dès que vos dates de pressage seront fixées.</p>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="text-align: center; font-weight: bold; color: #2D3748;">TAZDAYTH</p>
            </div>
        `,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        logEmailSent(email, info);
    } catch (error: any) {
        console.error(`[MAIL] Échec d'envoi confirmation pressage:`, error.message);
    }
};

const logEmailSent = (email: string, info: any) => {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
        console.log('\n' + '📬'.repeat(20));
        console.log(`EMAIL ENVOYÉ à ${email} ! Voir ici:`);
        console.log(`\n👉  ${previewUrl}\n`);
        console.log('📬'.repeat(20) + '\n');
    } else {
        console.log(`[MAIL] Email envoyé à ${email} via SMTP réel.`);
    }
};


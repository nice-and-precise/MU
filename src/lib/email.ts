import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string | string[];
    subject: string;
    html: string;
}) => {
    try {
        const data = await resend.emails.send({
            from: 'Midwest Underground <notifications@midwestunderground.com>', // Update with verified domain
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

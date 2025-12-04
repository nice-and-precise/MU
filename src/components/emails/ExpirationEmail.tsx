import React from 'react';

interface ExpirationEmailProps {
    ticketNumber: string;
    expirationDate: string;
    daysUntil: number;
    workSiteAddress: string;
    ticketUrl: string;
}

export const ExpirationEmailTemplate = ({
    ticketNumber,
    expirationDate,
    daysUntil,
    workSiteAddress,
    ticketUrl,
}: ExpirationEmailProps) => {
    const isExpired = daysUntil < 0;
    const statusColor = isExpired ? '#ef4444' : '#f59e0b';
    const statusText = isExpired ? 'EXPIRED' : `Expires in ${daysUntil} Days`;

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ color: '#1f2937', margin: '0' }}>811 Ticket Alert</h1>
                <div style={{
                    display: 'inline-block',
                    backgroundColor: statusColor,
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    marginTop: '10px',
                    fontWeight: 'bold'
                }}>
                    {statusText}
                </div>
            </div>

            <div style={{ marginBottom: '20px', color: '#4b5563', lineHeight: '1.5' }}>
                <p>Hello,</p>
                <p>The following GSOC ticket is approaching expiration or has expired. Please review and take necessary action.</p>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '8px 0', color: '#6b7280', width: '140px' }}>Ticket Number:</td>
                            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#111827' }}>{ticketNumber}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px 0', color: '#6b7280' }}>Expiration Date:</td>
                            <td style={{ padding: '8px 0', fontWeight: 'bold', color: '#111827' }}>{expirationDate}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px 0', color: '#6b7280' }}>Location:</td>
                            <td style={{ padding: '8px 0', color: '#111827' }}>{workSiteAddress}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <a
                    href={ticketUrl}
                    style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        display: 'inline-block'
                    }}
                >
                    View Ticket Details
                </a>
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
                <p>Midwest Underground 811 Management System</p>
            </div>
        </div>
    );
};

export const generateExpirationEmailHtml = (props: ExpirationEmailProps) => {
    // Simple SSR for email HTML generation since we aren't using the full react-email compiler here
    // In a real production app with react-email, we'd use render(<ExpirationEmailTemplate ... />)
    // For now, we'll return a string representation or use ReactDOMServer if available, 
    // but to keep dependencies low and robust, we will just construct the HTML string directly 
    // mirroring the component above for the actual email body.

    const { ticketNumber, expirationDate, daysUntil, workSiteAddress, ticketUrl } = props;
    const isExpired = daysUntil < 0;
    const statusColor = isExpired ? '#ef4444' : '#f59e0b';
    const statusText = isExpired ? 'EXPIRED' : `Expires in ${daysUntil} Days`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>811 Ticket Alert</title>
    </head>
    <body style="font-family: sans-serif; margin: 0; padding: 20px; background-color: #ffffff;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #1f2937; margin: 0;">811 Ticket Alert</h1>
          <div style="display: inline-block; background-color: ${statusColor}; color: white; padding: 5px 10px; border-radius: 4px; margin-top: 10px; font-weight: bold;">
            ${statusText}
          </div>
        </div>

        <div style="margin-bottom: 20px; color: #4b5563; line-height: 1.5;">
          <p>Hello,</p>
          <p>The following GSOC ticket is approaching expiration or has expired. Please review and take necessary action.</p>
        </div>

        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 140px;">Ticket Number:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${ticketNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Expiration Date:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${expirationDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Location:</td>
                <td style="padding: 8px 0; color: #111827;">${workSiteAddress}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${ticketUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
            View Ticket Details
          </a>
        </div>
        
        <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
          <p>Midwest Underground 811 Management System</p>
        </div>
      </div>
    </body>
    </html>
    `;
};

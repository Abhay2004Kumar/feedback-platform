import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { formId, email, formUrl } = await req.json();
    
    // In a real app, you would verify the user has permission to share this form
    // and that the email is valid
    
    if (!formId || !email || !formUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Replace with your verified sender
      to: email,
      subject: 'You\'ve been invited to fill out a form',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to fill out a form</h2>
          <p>Click the button below to access the form:</p>
          <a 
            href="${formUrl}" 
            style="
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #2563eb; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px;
              margin: 16px 0;
            "
          >
            Go to Form
          </a>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${formUrl}" style="color: #2563eb;">${formUrl}</a></p>
          <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
            This link will expire in 30 days.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in share form API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

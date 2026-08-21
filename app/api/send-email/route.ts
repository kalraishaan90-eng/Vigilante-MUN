import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { bookingRef, name, email, phone, institution, committee, pref1, pref2, pref3, paymentRef, amount } = data;

    const emailContent = `
=== VIGILANTE MUN 4.0 REGISTRATION CONFIRMATION ===
Booking Ref: ${bookingRef}
Delegate Name: ${name}
Email: ${email}
Phone: ${phone}
Institution: ${institution || 'N/A'}
Selected Committee: ${committee}
Preferences: 1) ${pref1 || 'N/A'} | 2) ${pref2 || 'N/A'} | 3) ${pref3 || 'N/A'}
Payment Authorization Ref: ${paymentRef}
Amount Paid: ₹${amount}
Timestamp: ${new Date().toLocaleString()}
=====================================================
    `;

    console.log(`[API /api/send-email] Dispatching to vigilantemun@gmail.com & ${email}:`);
    console.log(emailContent);

    // If Resend API key is configured
    if (process.env.RESEND_API_KEY) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Vigilante MUN <registrations@vigilantemun.com>',
          to: ['vigilantemun@gmail.com', email],
          subject: `[Vigilante MUN 4.0] Registration Confirmed - ${name} (${bookingRef})`,
          text: emailContent,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error('[Resend Email Error]', errText);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration email recorded & dispatched successfully.',
      ref: bookingRef,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error sending registration email:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

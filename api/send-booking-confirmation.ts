import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const b = req.body;
  if (!b?.email) return res.status(400).json({ error: "Missing booking data" });

  const ref = b.id?.slice(0, 8).toUpperCase() ?? "XXXXXXXX";
  const dateStr = new Date(b.date).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=ffffff&bgcolor=0a0a0a&data=MACCITY-${ref}&margin=10`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Booking Confirmed — Mac City</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
  <tr><td align="center">
    <table width="440" cellpadding="0" cellspacing="0" style="max-width:440px;width:100%;background:#0a0a0a;border:1px solid #222;border-radius:24px;overflow:hidden;">

      <!-- MACCITY headline -->
      <tr>
        <td style="padding:36px 36px 24px;">
          <p style="margin:0;font-size:80px;font-weight:900;color:#fff;line-height:0.85;letter-spacing:-3px;font-family:'Arial Black',Arial,sans-serif;">MAC<br/>CITY</p>
          <p style="margin:20px 0 0;font-size:15px;font-weight:700;color:#fcbb04;line-height:1.5;">${b.services.join(" + ")}</p>
          <p style="margin:6px 0 0;font-size:13px;color:#555;">${b.year} ${b.make} ${b.model}</p>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 36px;"><div style="border-top:2px dashed #222;"></div></td></tr>

      <!-- Details -->
      <tr>
        <td style="padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-bottom:16px;">
                <p style="margin:0 0 3px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#555;">Date</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">${dateStr}</p>
              </td>
              <td style="padding-bottom:16px;text-align:right;">
                <p style="margin:0 0 3px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#555;">Time</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">${b.time}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-bottom:16px;">
                <p style="margin:0 0 3px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#555;">Name</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">${b.name}</p>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:0;">
                <p style="margin:0 0 3px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#555;">Phone</p>
                <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">${b.phone}</p>
              </td>
              <td style="padding-bottom:0;text-align:right;">
                <p style="margin:0 0 3px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#555;">Email</p>
                <p style="margin:0;font-size:11px;font-weight:700;color:#fff;">${b.email}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- QR code -->
      <tr>
        <td style="padding:0 36px 28px;text-align:center;">
          <img src="${qrUrl}" width="120" height="120" alt="QR Code" style="border-radius:12px;display:block;margin:0 auto;" />
          <p style="margin:10px 0 0;font-size:10px;letter-spacing:3px;color:#333;">#${ref}</p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0e0e0e;border-top:1px solid #1a1a1a;padding:20px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#444;">1/7 England Street, Dandenong South VIC 3175</p>
          <p style="margin:6px 0 0;font-size:11px;color:#444;">Need help? <a href="tel:+61426899272" style="color:#fcbb04;text-decoration:none;">+61 426 899 272</a></p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Mac City <bookings@maccity.com.au>",
        to: b.email,
        subject: `Booking Confirmed — ${dateStr} at ${b.time}`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

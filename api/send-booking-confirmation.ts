import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const b = req.body;
  if (!b?.email) return res.status(400).json({ error: "Missing booking data" });

  const ref = b.id?.slice(0, 8).toUpperCase() ?? "XXXXXXXX";
  const dateStr = new Date(b.date).toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

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
    <table width="540" cellpadding="0" cellspacing="0" style="max-width:540px;width:100%;">

      <!-- Header -->
      <tr>
        <td style="background:#fcbb04;border-radius:16px 16px 0 0;padding:32px 40px;">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#000;opacity:0.6;">Mac City Car Workshop</p>
          <h1 style="margin:8px 0 0;font-size:32px;font-weight:800;color:#000;letter-spacing:-1px;">Booking Confirmed</h1>
        </td>
      </tr>

      <!-- Ticket body -->
      <tr>
        <td style="background:#141414;border-left:1px solid #222;border-right:1px solid #222;padding:32px 40px;">

          <!-- Ref -->
          <p style="margin:0 0 24px;font-size:11px;letter-spacing:2px;color:#666;text-transform:uppercase;">Booking Reference</p>
          <p style="margin:0 0 32px;font-size:28px;font-weight:800;color:#fcbb04;letter-spacing:4px;">#${ref}</p>

          <!-- Date & Time -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="width:50%;padding-right:16px;">
                <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Date</p>
                <p style="margin:0;font-size:16px;font-weight:700;color:#fff;">${dateStr}</p>
              </td>
              <td style="width:50%;border-left:1px solid #333;padding-left:16px;">
                <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Time</p>
                <p style="margin:0;font-size:16px;font-weight:700;color:#fff;">${b.time}</p>
              </td>
            </tr>
          </table>

          <!-- Perforated line -->
          <div style="border-top:2px dashed #333;margin:0 -40px 32px;"></div>

          <!-- Vehicle -->
          <p style="margin:0 0 8px;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Vehicle</p>
          <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#fff;">${b.year} ${b.make} ${b.model}</p>

          <!-- Services -->
          <p style="margin:0 0 12px;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Services</p>
          <div style="margin-bottom:32px;">
            ${b.services.map((s: string) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 14px;border:1px solid #333;border-radius:100px;font-size:13px;color:#ccc;">${s}</span>`).join("")}
          </div>

          <!-- Perforated line -->
          <div style="border-top:2px dashed #333;margin:0 -40px 32px;"></div>

          <!-- Workshop -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:50%;padding-right:16px;">
                <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Location</p>
                <p style="margin:0;font-size:13px;color:#ccc;line-height:1.6;">1/7 England Street<br/>Dandenong South VIC 3175</p>
              </td>
              <td style="width:50%;border-left:1px solid #333;padding-left:16px;">
                <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;color:#666;text-transform:uppercase;">Contact</p>
                <p style="margin:0;font-size:13px;color:#ccc;line-height:1.6;">+61 426 899 272<br/>info@maccity.com.au</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0e0e0e;border:1px solid #222;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#555;">Need to make changes? Call us on <a href="tel:+61426899272" style="color:#fcbb04;text-decoration:none;">+61 426 899 272</a></p>
          <p style="margin:8px 0 0;font-size:11px;color:#444;">© Mac City Car Workshop, Dandenong South VIC</p>
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
        from: "Mac City <onboarding@resend.dev>",
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

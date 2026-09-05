/**
 * Generates a standalone HTML page that displays an uploaded poster image.
 * The poster is embedded as a canvas-compressed JPEG data URL, and the page
 * is uploaded via the existing upload API (anonymous = 7-day tmp, logged-in
 * = permanent). The returned URL is used to generate the QR code.
 */

export interface PetPosterData {
  posterDataUrl: string;
  petName: string;
  ownerName: string;
  ownerPhone: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generatePetPosterHTML(data: PetPosterData, t: (key: string) => string): string {
  const name = escapeHtml(data.petName || "Pet");
  const phone = escapeHtml(data.ownerPhone || "");
  const owner = escapeHtml(data.ownerName || "");

  const contactBlock = phone
    ? `<div class="contact-box">
    <a href="tel:${phone}" class="btn btn-call" style="color:#fff;text-decoration:none">
      &#x1F4DE; ${t("petsafe.qr.callOwner")}
    </a>
    <div class="phone">${phone}</div>
    <div class="label">${t("petsafe.poster.ownerPrefix")}${owner || t("petsafe.poster.ownerEmpty")}</div>
  </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>PAW&CLAW Safe Poster - ${name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fffef0;color:#1a1a1a;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px}
.alert{background:#ffcc00;border:3px solid #1a1a1a;box-shadow:4px 4px 0 #1a1a1a;padding:12px 20px;border-radius:12px;text-align:center;margin-bottom:16px;width:100%;max-width:480px}
.alert h2{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em}
.card{background:#fff;border:3px solid #1a1a1a;box-shadow:6px 6px 0 #1a1a1a;border-radius:12px;padding:16px;width:100%;max-width:480px}
.poster-img{display:block;width:100%;height:auto;border:3px solid #1a1a1a;border-radius:8px;background:#fffef0}
.contact-box{background:#ff3333;color:#fff;border:3px solid #1a1a1a;box-shadow:4px 4px 0 #1a1a1a;border-radius:12px;padding:16px;text-align:center;margin-top:16px}
.contact-box .phone{font-size:24px;font-weight:900;letter-spacing:2px;font-family:monospace}
.contact-box .label{font-size:12px;font-weight:700;margin-top:4px}
.btn{display:block;width:100%;padding:14px;border:3px solid #1a1a1a;font-weight:900;font-size:14px;text-transform:uppercase;cursor:pointer;text-align:center;text-decoration:none;border-radius:8px;margin-top:10px;box-shadow:4px 4px 0 #1a1a1a;transition:all 0.1s}
.btn:active{transform:translate(4px,4px);box-shadow:none}
.btn-call{background:#ff3333;color:#fff}
.footer{margin-top:20px;text-align:center;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#4a4a4a}
</style>
</head>
<body>

<div class="alert">
  <h2>&#x26A0;&#xFE0F; ${t("petsafe.poster.emergency")}</h2>
  <p style="font-size:13px;font-weight:900;margin-top:4px;text-transform:uppercase">${name}</p>
</div>

<div class="card">
  <img src="${data.posterDataUrl}" alt="Lost pet poster" class="poster-img">
  ${contactBlock}
</div>

<div class="footer">PAW&amp;CLAW SAFE · ${t("petsafe.poster.footer")}</div>

</body>
</html>`;
}

/**
 * Generates a standalone HTML landing page for a lost pet.
 * This page is uploaded to R2 via the existing upload API,
 * and the returned URL is used to generate the QR code.
 */

export interface PetLandingData {
  name: string;
  breed: string;
  gender: string;
  chipId: string;
  reward: string;
  features: string;
  lostLocation: string;
  lostTime: string;
  ownerName: string;
  ownerPhone: string;
  avatarUrl: string;
  tagMedical: boolean;
  tagTimid: boolean;
  tagReward: boolean;
}

export function generatePetLandingHTML(data: PetLandingData, t: (key: string) => string): string {
  const tags: string[] = [];
  if (data.tagMedical) tags.push(`<span style="display:inline-block;padding:4px 12px;background:#ff3333;color:#fff;font-weight:900;font-size:12px;border:3px solid #1a1a1a;box-shadow:3px 3px 0 #1a1a1a;margin-right:6px">${t("petsafe.form.tagMedical")}</span>`);
  if (data.tagTimid) tags.push(`<span style="display:inline-block;padding:4px 12px;background:#ffcc00;color:#1a1a1a;font-weight:900;font-size:12px;border:3px solid #1a1a1a;box-shadow:3px 3px 0 #1a1a1a;margin-right:6px">${t("petsafe.form.tagTimid")}</span>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Pet Safe - ${data.name || "Lost Pet"}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#fffef0;color:#1a1a1a;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:20px}
.alert{background:#ffcc00;border:3px solid #1a1a1a;box-shadow:4px 4px 0 #1a1a1a;padding:12px 20px;border-radius:12px;text-align:center;margin-bottom:16px;width:100%;max-width:400px}
.alert h2{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em}
.card{background:#fff;border:3px solid #1a1a1a;box-shadow:6px 6px 0 #1a1a1a;border-radius:12px;padding:20px;width:100%;max-width:400px}
.pet-img{width:100%;aspect-ratio:4/3;object-fit:cover;border:3px solid #1a1a1a;border-radius:8px;margin-bottom:12px}
.pet-name{font-size:24px;font-weight:900;text-transform:uppercase;border-bottom:3px solid #1a1a1a;padding-bottom:8px;margin-bottom:8px}
.pet-meta{font-size:13px;color:#4a4a4a;margin-bottom:12px}
.tags{margin-bottom:16px}
.info-row{font-size:13px;font-weight:700;margin-bottom:6px}
.info-row strong{font-weight:900;text-transform:uppercase;font-size:11px}
.info-row .highlight{background:#ffcc00;padding:1px 6px;font-weight:900}
.contact-box{background:#ff3333;color:#fff;border:3px solid #1a1a1a;box-shadow:4px 4px 0 #1a1a1a;border-radius:12px;padding:16px;text-align:center;margin-top:16px}
.contact-box .phone{font-size:28px;font-weight:900;letter-spacing:2px;font-family:monospace}
.contact-box .label{font-size:12px;font-weight:700;margin-top:4px}
.warning{border:3px dashed #1a1a1a;background:#fffef0;padding:12px;border-radius:8px;margin-top:16px;font-size:12px;font-weight:700}
.warning strong{display:block;margin-bottom:4px;font-weight:900;text-transform:uppercase;font-size:11px}
.footer{margin-top:20px;text-align:center;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;color:#4a4a4a}
.btn{display:block;width:100%;padding:14px;border:3px solid #1a1a1a;font-weight:900;font-size:14px;text-transform:uppercase;cursor:pointer;text-align:center;text-decoration:none;border-radius:8px;margin-top:10px;box-shadow:4px 4px 0 #1a1a1a;transition:all 0.1s}
.btn:active{transform:translate(4px,4px);box-shadow:none}
.btn-call{background:#ff3333;color:#fff}
.btn-location{background:#33cc33;color:#1a1a1a}
</style>
</head>
<body>

<div class="alert">
  <h2>&#x26A0;&#xFE0F; ${t("petsafe.qr.landingThank")}</h2>
  <p style="font-size:12px;font-weight:700;margin-top:4px">${t("petsafe.qr.landingDesc")}</p>
</div>

<div class="card">
  <img src="${data.avatarUrl}" alt="Pet" class="pet-img">

  <div class="pet-name">
    ${data.name || "Pet"}
    <span style="display:inline-block;background:#ff3333;color:#fff;font-size:11px;padding:2px 8px;vertical-align:middle;margin-left:8px">${t("petsafe.qr.statusLost")}</span>
  </div>

  <div class="pet-meta">${data.breed} · ${data.gender}</div>

  ${tags.length ? `<div class="tags">${tags.join("")}</div>` : ""}

  ${data.tagReward && data.reward ? `<div style="background:#ffcc00;display:inline-block;padding:4px 10px;font-weight:900;font-size:13px;border:2px solid #1a1a1a;margin-bottom:12px">${t("petsafe.poster.reward")} ${data.reward}</div>` : ""}

  <div class="info-row"><strong>${t("petsafe.poster.feature")}</strong> ${data.features || t("petsafe.poster.featureEmpty")}</div>
  <div class="info-row"><strong class="highlight">${t("petsafe.poster.location")}</strong> ${data.lostLocation || t("petsafe.poster.locationEmpty")}</div>
  <div class="info-row"><strong>${t("petsafe.poster.time")}</strong> ${data.lostTime || t("petsafe.poster.timeEmpty")}</div>
  <div class="info-row" style="font-size:11px;color:#4a4a4a"><strong>${t("petsafe.poster.chip")}</strong> ${data.chipId || t("petsafe.poster.chipEmpty")}</div>

  <div class="contact-box">
    <a href="tel:${data.ownerPhone}" class="btn btn-call" style="color:#fff;text-decoration:none">
      &#x1F4DE; ${t("petsafe.qr.callOwner")}
    </a>
    <div class="label">${t("petsafe.poster.ownerPrefix")}${data.ownerName || t("petsafe.poster.ownerEmpty")}</div>
  </div>

  <div class="warning">
    <strong><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align:-2px"><path d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg> ${t("petsafe.qr注意事项")}</strong>
    ${data.tagMedical ? t("petsafe.qr.urgentMed") + " " : ""}${data.features || ""}${t("petsafe.qr.noChase")}
  </div>
</div>

<div class="footer">Pet Safe · ${t("petsafe.poster.footer")}</div>

</body>
</html>`;
}

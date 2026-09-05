import { describe, it, expect } from "vitest";
import { generatePetLandingHTML, type PetLandingData } from "../app/components/petsafe/pet-landing-template";

const t = (key: string) => key;

const baseData: PetLandingData = {
  name: "Cola",
  breed: "Corgi",
  gender: "Male",
  chipId: "981020003892819",
  reward: "$300",
  features: "Heart-shaped patch",
  lostLocation: "Wangjing SOHO",
  lostTime: "2026-09-01 08:30",
  ownerName: "Ms Zhang",
  ownerPhone: "138-0013-8888",
  avatarUrl: "https://example.com/pet.jpg",
  tagMedical: false,
  tagTimid: false,
  tagReward: false,
};

describe("generatePetLandingHTML", () => {
  it("generates valid HTML with DOCTYPE", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("</html>");
  });

  it("includes pet name in title and body", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain("<title>Pet Safe - Cola</title>");
    expect(html).toContain("Cola");
  });

  it("falls back to 'Lost Pet' when name is empty", () => {
    const html = generatePetLandingHTML({ ...baseData, name: "" }, t);
    expect(html).toContain("Pet Safe - Lost Pet");
    expect(html).toMatch(/\n\s+Pet\n/);
  });

  it("includes breed and gender", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain("Corgi");
    expect(html).toContain("Male");
  });

  it("includes avatar image", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain('src="https://example.com/pet.jpg"');
  });

  it("includes lost location and time", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain("Wangjing SOHO");
    expect(html).toContain("2026-09-01 08:30");
  });

  it("includes chip ID", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain("981020003892819");
  });

  it("includes owner name", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain("Ms Zhang");
  });

  it("includes phone in tel link", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toContain('href="tel:138-0013-8888"');
  });

  it("does not display phone number text", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).not.toContain('<div class="phone">');
  });

  it("shows medical tag when tagMedical is true", () => {
    const html = generatePetLandingHTML({ ...baseData, tagMedical: true }, t);
    expect(html).toContain("petsafe.form.tagMedical");
    expect(html).toContain("background:#ff3333");
  });

  it("hides medical tag when tagMedical is false", () => {
    const html = generatePetLandingHTML({ ...baseData, tagMedical: false }, t);
    expect(html).not.toContain("petsafe.form.tagMedical");
  });

  it("shows timid tag when tagTimid is true", () => {
    const html = generatePetLandingHTML({ ...baseData, tagTimid: true }, t);
    expect(html).toContain("petsafe.form.tagTimid");
    expect(html).toContain("background:#ffcc00");
  });

  it("hides timid tag when tagTimid is false", () => {
    const html = generatePetLandingHTML({ ...baseData, tagTimid: false }, t);
    expect(html).not.toContain("petsafe.form.tagTimid");
  });

  it("shows reward when tagReward is true and reward is set", () => {
    const html = generatePetLandingHTML({ ...baseData, tagReward: true, reward: "$500" }, t);
    expect(html).toContain("$500");
    expect(html).toContain("petsafe.poster.reward");
  });

  it("hides reward when tagReward is false", () => {
    const html = generatePetLandingHTML({ ...baseData, tagReward: false }, t);
    expect(html).not.toContain("petsafe.poster.reward");
  });

  it("hides reward when tagReward is true but reward is empty", () => {
    const html = generatePetLandingHTML({ ...baseData, tagReward: true, reward: "" }, t);
    expect(html).not.toContain("petsafe.poster.reward");
  });

  it("shows both tags when both tagMedical and tagTimid are true", () => {
    const html = generatePetLandingHTML({ ...baseData, tagMedical: true, tagTimid: true }, t);
    expect(html).toContain("petsafe.form.tagMedical");
    expect(html).toContain("petsafe.form.tagTimid");
  });

  it("shows no tags when both are false", () => {
    const html = generatePetLandingHTML({ ...baseData, tagMedical: false, tagTimid: false }, t);
    expect(html).not.toContain("petsafe.form.tagMedical");
    expect(html).not.toContain("petsafe.form.tagTimid");
    expect(html).not.toContain("class=\"tags\"");
  });

  it("shows urgentMed in warning when tagMedical is true", () => {
    const html = generatePetLandingHTML({ ...baseData, tagMedical: true }, t);
    expect(html).toContain("petsafe.qr.urgentMed");
  });

  it("does not show urgentMed when tagMedical is false", () => {
    const html = generatePetLandingHTML({ ...baseData, tagMedical: false }, t);
    expect(html).not.toContain("petsafe.qr.urgentMed");
  });

  it("falls back to 'Pet' features when empty", () => {
    const html = generatePetLandingHTML({ ...baseData, features: "" }, t);
    expect(html).toContain("petsafe.poster.featureEmpty");
  });

  it("falls back to 'Pet' location when empty", () => {
    const html = generatePetLandingHTML({ ...baseData, lostLocation: "" }, t);
    expect(html).toContain("petsafe.poster.locationEmpty");
  });

  it("falls back to 'Pet' time when empty", () => {
    const html = generatePetLandingHTML({ ...baseData, lostTime: "" }, t);
    expect(html).toContain("petsafe.poster.timeEmpty");
  });

  it("falls back to 'Pet' chip when empty", () => {
    const html = generatePetLandingHTML({ ...baseData, chipId: "" }, t);
    expect(html).toContain("petsafe.poster.chipEmpty");
  });

  it("falls back to 'Pet' owner name when empty", () => {
    const html = generatePetLandingHTML({ ...baseData, ownerName: "" }, t);
    expect(html).toContain("petsafe.poster.ownerEmpty");
  });

  it("falls back to 'Pet' phone when empty", () => {
    const html = generatePetLandingHTML({ ...baseData, ownerPhone: "" }, t);
    expect(html).toContain('href="tel:"');
  });

  it("passes translation keys to t function", () => {
    const calls: string[] = [];
    const spy = (key: string) => { calls.push(key); return key; };
    generatePetLandingHTML(baseData, spy);
    expect(calls).toContain("petsafe.qr.landingThank");
    expect(calls).toContain("petsafe.qr.landingDesc");
    expect(calls).toContain("petsafe.qr.statusLost");
    expect(calls).toContain("petsafe.qr.callOwner");
    expect(calls).toContain("petsafe.qr注意事项");
    expect(calls).toContain("petsafe.qr.noChase");
    expect(calls).toContain("petsafe.poster.footer");
  });

  it("generates different HTML for different data", () => {
    const html1 = generatePetLandingHTML(baseData, t);
    const html2 = generatePetLandingHTML({ ...baseData, name: "Boba" }, t);
    expect(html1).toContain("Cola");
    expect(html2).toContain("Boba");
    expect(html1).not.toBe(html2);
  });

  it("returns complete HTML structure", () => {
    const html = generatePetLandingHTML(baseData, t);
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain("<head>");
    expect(html).toContain("</head>");
    expect(html).toContain("<body>");
    expect(html).toContain("</body>");
    expect(html).toContain("<style>");
    expect(html).toContain("class=\"alert\"");
    expect(html).toContain("class=\"card\"");
    expect(html).toContain("class=\"contact-box\"");
    expect(html).toContain("class=\"warning\"");
    expect(html).toContain("class=\"footer\"");
  });
});

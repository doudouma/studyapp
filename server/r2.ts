export const MAX_SIZE = 5 * 1024 * 1024;

export const BUCKET = (() => {
  try {
    return process.env.R2_BUCKET_NAME ?? "studypage";
  } catch {
    return "studypage";
  }
})();

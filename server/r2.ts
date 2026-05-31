export const MAX_SIZE = 5 * 1024 * 1024;

export const BUCKET = (() => {
  try {
    return process.env.R2_BUCKET_NAME ?? "studypage";
  } catch {
    return "studypage";
  }
})();

let _r2: any;

export async function getR2() {
  if (!_r2) {
    const { S3Client } = await import("@aws-sdk/client-s3");
    const accountId =
      (typeof process !== "undefined" && process.env?.R2_ACCOUNT_ID) || "";
    const accessKeyId =
      (typeof process !== "undefined" && process.env?.R2_ACCESS_KEY_ID) || "";
    const secretAccessKey =
      (typeof process !== "undefined" && process.env?.R2_SECRET_ACCESS_KEY) || "";
    _r2 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return _r2;
}
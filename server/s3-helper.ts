/**
 * Dynamic S3 client imports for local development.
 * Uses Function constructor to prevent esbuild static analysis from
 * following the import chain (which includes node:fs, not available
 * in Cloudflare Workers).
 */

const getS3Module = () => Function('return import("@aws-sdk/client-s3")')();

let s3Client: any = null;

export async function createS3Client() {
  if (!s3Client) {
    const mod = await getS3Module();
    const { S3Client } = mod;
    const accountId =
      (typeof process !== "undefined" && process.env?.R2_ACCOUNT_ID) || "";
    const accessKeyId =
      (typeof process !== "undefined" && process.env?.R2_ACCESS_KEY_ID) || "";
    const secretAccessKey =
      (typeof process !== "undefined" && process.env?.R2_SECRET_ACCESS_KEY) || "";
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3Client;
}

async function s3Cmd(cmdName: string, key: string, body?: string | Uint8Array, contentType?: string) {
  const mod = await getS3Module();
  const Command = mod[cmdName];
  const client = await createS3Client();
  const params: any = { Bucket: "studypage", Key: key };
  if (body !== undefined) { params.Body = body; params.ContentType = contentType; }
  await client.send(new Command(params));
}

export async function s3PutObject(key: string, body: string | Uint8Array, contentType: string) {
  await s3Cmd("PutObjectCommand", key, body, contentType);
}

export async function s3GetObject(key: string) {
  try {
    const mod = await getS3Module();
    const { GetObjectCommand } = mod;
    const client = await createS3Client();
    const res = await client.send(new GetObjectCommand({ Bucket: "studypage", Key: key }));
    return { body: res.Body, contentType: res.ContentType };
  } catch {
    return null;
  }
}

export async function s3DeleteObject(key: string) {
  await s3Cmd("DeleteObjectCommand", key);
}

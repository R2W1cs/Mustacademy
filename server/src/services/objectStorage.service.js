import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import logger from '../utils/logger.js';

let s3Client;

export function isObjectStorageEnabled() {
  return Boolean(
    process.env.S3_BUCKET &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  );
}

function getClient() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });
  }
  return s3Client;
}

export function publicUrlForKey(key) {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
  if (!base) {
    throw new Error('S3_PUBLIC_URL is required when object storage is enabled');
  }
  return `${base}/${key}`;
}

export function keyFromStoredUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const publicBase = process.env.S3_PUBLIC_URL?.replace(/\/$/, '');
  if (publicBase && url.startsWith(`${publicBase}/`)) {
    return url.slice(publicBase.length + 1);
  }

  if (url.startsWith('/uploads/videos/')) {
    return `videos/${url.replace('/uploads/videos/', '')}`;
  }
  if (url.startsWith('/tts-docum/')) {
    return `tts/docum/${url.replace('/tts-docum/', '')}`;
  }
  if (url.startsWith('/tts-podcasts/')) {
    return `tts/podcasts/${url.replace('/tts-podcasts/', '')}`;
  }
  if (/^videos\//.test(url) || /^tts\//.test(url)) {
    return url;
  }

  return null;
}

export async function uploadObject({ key, body, contentType, cacheControl }) {
  await getClient().send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: cacheControl || 'public, max-age=31536000, immutable',
  }));
  logger.info(`[Storage] Uploaded s3://${process.env.S3_BUCKET}/${key}`);
  return key;
}

export async function deleteObject(key) {
  if (!key) return;
  await getClient().send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  }));
  logger.info(`[Storage] Deleted s3://${process.env.S3_BUCKET}/${key}`);
}

export async function getSignedReadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

function uniqueFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const stamp = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  return `${stamp}${ext}`;
}

export async function storeVideo(file) {
  const filename = uniqueFilename(file.originalname);

  if (isObjectStorageEnabled()) {
    const key = `videos/${filename}`;
    await uploadObject({
      key,
      body: file.buffer,
      contentType: file.mimetype,
    });
    return { url: publicUrlForKey(key), key };
  }

  const dir = path.join(process.cwd(), 'uploads', 'videos');
  fs.mkdirSync(dir, { recursive: true });
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, file.buffer);
  return { url: `/uploads/videos/${filename}`, key: null };
}

export async function removeStoredVideo(videoUrl) {
  if (isObjectStorageEnabled()) {
    const key = keyFromStoredUrl(videoUrl);
    if (key) await deleteObject(key);
    return;
  }

  if (!videoUrl?.startsWith('/uploads/')) return;
  const filePath = path.join(process.cwd(), videoUrl);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export async function uploadLocalFile(localPath, objectKey, contentType) {
  const body = fs.readFileSync(localPath);
  await uploadObject({ key: objectKey, body, contentType });
  return publicUrlForKey(objectKey);
}
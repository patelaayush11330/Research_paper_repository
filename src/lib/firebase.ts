import admin from 'firebase-admin';
import { Readable } from 'stream';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App;

if (!admin.apps.length) {
  // Check if we have the required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey || !storageBucket) {
    throw new Error('Missing Firebase configuration environment variables');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    storageBucket,
  });
} else {
  firebaseApp = admin.app();
}

export const storage = admin.storage();
export const bucket = storage.bucket();

// Upload file to Firebase Storage
export async function uploadFile(
  file: Buffer | Uint8Array,
  fileName: string,
  mimeType: string
): Promise<string> {
  const fileRef = bucket.file(`papers/${fileName}`);
  const stream = fileRef.createWriteStream({
    metadata: {
      contentType: mimeType,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('finish', async () => {
      try {
        // Make the file publicly readable
        await fileRef.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/papers/${fileName}`;
        resolve(publicUrl);
      } catch (error) {
        reject(error);
      }
    });

    const bufferStream = new Readable();
    bufferStream.push(file);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  });
}

// Delete file from Firebase Storage
export async function deleteFile(fileName: string): Promise<void> {
  try {
    const fileRef = bucket.file(`papers/${fileName}`);
    await fileRef.delete();
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    throw error;
  }
}

// Get file metadata from Firebase Storage
export async function getFileMetadata(fileName: string) {
  try {
    const fileRef = bucket.file(`papers/${fileName}`);
    const [metadata] = await fileRef.getMetadata();
    return metadata;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}
import { upload } from '@vercel/blob/client';

/**
 * Uploads a file to Vercel Blob and returns the public URL.
 * @param file The file to upload
 * @param path The path/filename in storage
 */
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const blob = await upload(path, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    
    return blob.url;
  } catch (error) {
    console.error("Error uploading image to Vercel Blob:", error);
    throw error;
  }
};


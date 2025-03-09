import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

/**
 * Upload file to S3
 * @param file File buffer to upload
 * @param fileName Original file name
 * @param contentType MIME type of the file
 * @param folder Folder path in the bucket (without trailing slash)
 * @returns Promise with the upload result
 */
export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<{ url: string; key: string }> => {
  // Generate a unique file name
  const fileExtension = fileName.split('.').pop();
  const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: uniqueFileName,
    Body: file,
    ContentType: contentType,
    ACL: 'public-read',
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      url: result.Location,
      key: result.Key,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

/**
 * Delete file from S3
 * @param key Key of the file to delete (the path in the bucket)
 * @returns Promise with the deletion result
 */
export const deleteFromS3 = async (key: string): Promise<AWS.S3.DeleteObjectOutput> => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
  };

  try {
    return await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

/**
 * Get a signed URL for a file in S3 (for temporary access)
 * @param key Key of the file to get URL for
 * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL
 */
export const getSignedUrl = (key: string, expiresIn: number = 3600): string => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    Expires: expiresIn,
  };

  try {
    return s3.getSignedUrl('getObject', params);
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};
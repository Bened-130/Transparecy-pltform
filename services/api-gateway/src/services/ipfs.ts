import axios from 'axios';
import FormData from 'form-data';

const IPFS_API_URL = process.env.IPFS_API_URL || 'http://localhost:5001';

export async function uploadToIPFS(fileBuffer: Buffer, filename: string): Promise<string> {
  try {
    const form = new FormData();
    form.append('file', fileBuffer, filename);

    const response = await axios.post(`${IPFS_API_URL}/api/v0/add`, form, {
      headers: form.getHeaders(),
    });

    return response.data.Hash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

export async function getFromIPFS(hash: string): Promise<Buffer> {
  try {
    const response = await axios.get(`${IPFS_API_URL}/api/v0/cat?arg=${hash}`, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    throw new Error('Failed to retrieve from IPFS');
  }
}

export function getIPFSGatewayUrl(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

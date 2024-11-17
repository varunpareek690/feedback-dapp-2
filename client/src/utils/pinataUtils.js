import axios from 'axios';

const PINATA_API_KEY = ''
const PINATA_SECRET_KEY =''

export const uploadToPinata = async (jsonData) => {
  try {
    const data = JSON.stringify({
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: `feedback-form-${Date.now()}`
      },
      pinataContent: jsonData
    });

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

// Utility function to fetch from Pinata
export const fetchFromPinata = async (ipfsHash) => {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching from Pinata:", error);
    throw error;
  }
};
export const validatePinataConnection = async () => {
  try {
    const response = await axios.get(
      'https://api.pinata.cloud/data/testAuthentication',
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      }
    );
    return response.status === 200;
  } catch (error) {
    console.error("Error validating Pinata connection:", error);
    return false;
  }
};
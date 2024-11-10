import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import FeedbackSystem from './contracts/FeedbackSystem.json';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import FormViewer from './components/FormViewer';
import { uploadToPinata, fetchFromPinata, validatePinataConnection } from './utils/pinataUtils';

const contractAddress = "0xfd276ba4E54CFf9E946fCE956aC69E655abE78e3";

function App() {
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [forms, setForms] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);

  // Connect to MetaMask and contract
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, FeedbackSystem.abi, signer);
  
        setAccount(accounts[0]);
        setContract(contract);
  
        {contract && (
          <FormViewer contract={contract}/>
        )}
        // Check if user is admin
        const adminStatus = await contract.admins(accounts[0]);
        setIsAdmin(adminStatus);
  
        // Account change listener without reload
        window.ethereum.on('accountsChanged', (newAccounts) => {
          setAccount(newAccounts[0]);
          window.location.reload();
        });
  
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };
  
  // Admin: Create new form
  const createForm = async (formData) => {
    try {
      setLoading(true);
      const ipfsHash = await uploadToPinata(formData);
      const tx = await contract.createForm(ipfsHash);
      await tx.wait();
      await fetchAllForms();
    } catch (error) {
      console.error("Error creating form:", error);
    } finally {
      setLoading(false);
    }
  };

  // User: Submit form response
  // In your App.js file, update the submitResponse function:

const submitResponse = async (formId, responseData) => {
  try {
    setLoading(true);
    
    // Add metadata to the response
    const enrichedResponseData = {
      ...responseData,
      respondent: account, // Add the respondent's address
      submittedAt: new Date().toISOString(),
    };

    // Upload response to IPFS via Pinata
    const ipfsHash = await uploadToPinata(enrichedResponseData);
    console.log('Response uploaded to IPFS with hash:', ipfsHash);

    // Submit the response hash to the smart contract
    const tx = await contract.submitResponse(formId, ipfsHash);
    await tx.wait();

    console.log('Response submitted successfully!');
    
    // Optionally refresh the forms list
    await fetchAllForms();
  } catch (error) {
    console.error("Error submitting response:", error);
    throw error; // Re-throw to handle in the UI
  } finally {
    setLoading(false);
  }
};
  // Fetch all available forms
  const fetchAllForms = async () => {
    try {
      setLoading(true);
      const formCount = await contract.formCount();
      const fetchedForms = [];

      for (let i = 1; i <= formCount; i++) {
        const form = await contract.getForm(i);
        if (form.isActive) {
          const formData = await fetchFromPinata(form.formCID);
          fetchedForms.push({ id: i, ...formData, creator: form.creator });
        }
      }
      setForms(fetchedForms);
    } catch (error) {
      console.error("Error fetching forms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkPinataConnection = async () => {
      const isConnected = await validatePinataConnection();
      if (!isConnected) {
        console.error('Failed to connect to Pinata');
      }
    };
    checkPinataConnection();
  }, []);

  useEffect(() => {
    if (contract) {
      fetchAllForms();
    }
  }, [contract]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!account ? (
        <div className="text-center">
          <button 
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div>
          {loading && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="text-white">Processing...</div>
            </div>
          )}
          
          {isAdmin ? (
            <AdminDashboard 
              createForm={createForm}
              forms={forms}
              refreshForms={fetchAllForms}
            />
          ) : (
            <UserDashboard 
              forms={forms}
              submitResponse={submitResponse}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;

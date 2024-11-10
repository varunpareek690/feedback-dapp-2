import React, { useState, useEffect } from 'react';
import { fetchFromPinata } from '../utils/pinataUtils';

const FormViewer = ({ contract }) => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllForms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the total number of forms from the contract
      const formCount = await contract.formCount();
      console.log('Total forms:', formCount.toString());
      
      const fetchedForms = [];

      // Iterate through all forms
      for (let i = 1; i <= formCount; i++) {
        try {
          // Get form data from smart contract
          const form = await contract.getForm(i);
          console.log(`Form ${i} CID:`, form.formCID);
          
          if (form.isActive) {
            // Fetch the actual form data from IPFS using Pinata
            const formData = await fetchFromPinata(form.formCID);
            fetchedForms.push({
              id: i,
              ipfsHash: form.formCID,
              ...formData,
              creator: form.creator,
              timestamp: form.timestamp.toString()
            });
            console.log(`Form ${i} data:`, formData);
          }
        } catch (err) {
          console.error(`Error fetching form ${i}:`, err);
        }
      }

      setForms(fetchedForms);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setError("Failed to fetch forms. Please try again.");
      setLoading(false);
    }
  };

  // Function to fetch a single form by ID
  const fetchFormById = async (formId) => {
    try {
      setLoading(true);
      setError(null);

      // Get form data from smart contract
      const form = await contract.getForm(formId);
      console.log(`Fetching form ${formId} with CID:`, form.formCID);

      if (!form.isActive) {
        throw new Error("Form is not active");
      }

      // Fetch the actual form data from IPFS
      const formData = await fetchFromPinata(form.formCID);
      console.log('Form data:', formData);

      return {
        id: formId,
        ipfsHash: form.formCID,
        ...formData,
        creator: form.creator,
        timestamp: form.timestamp.toString()
      };
    } catch (err) {
      console.error(`Error fetching form ${formId}:`, err);
      setError(`Failed to fetch form ${formId}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) {
      fetchAllForms();
    }
  }, [contract]);

  return (
    <div className="p-4">
      {loading && (
        <div className="text-center">
          <p>Loading forms...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {forms.map((form) => (
          <div 
            key={form.id}
            className="border rounded-lg p-4 bg-white shadow"
          >
            <h2 className="text-xl font-bold mb-2">Form #{form.id}</h2>
            <p className="text-gray-600 mb-2">Created by: {form.creator}</p>
            <p className="text-gray-600 mb-2">IPFS Hash: {form.ipfsHash}</p>
            <div className="mt-4">
              <h3 className="font-bold mb-2">Form Data:</h3>
              <pre className="bg-gray-100 p-2 rounded">
                {JSON.stringify(form, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={() => fetchAllForms()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Forms
        </button>
      </div>
    </div>
  );
};

export default FormViewer;
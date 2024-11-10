// import React, {useState} from 'react';

// function UserDashboard({ forms, submitResponse }) {
//     const [selectedForm, setSelectedForm] = useState(null);
//     const [responses, setResponses] = useState({});
  
//     const handleSubmit = async () => {
//       const responseData = {
//         formId: selectedForm.id,
//         responses: Object.entries(responses).map(([questionId, answer]) => ({
//           questionId,
//           answer
//         }))
//       };
//       await submitResponse(selectedForm.id, responseData);
//       setSelectedForm(null);
//       setResponses({});
//     };
  
//     return (
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-2xl font-bold mb-4">Available Feedback Forms</h2>
        
//         {!selectedForm ? (
//           <div>
//             {forms.map(form => (
//               <div 
//                 key={form.id} 
//                 className="p-4 border rounded mb-4 cursor-pointer hover:bg-gray-50"
//                 onClick={() => setSelectedForm(form)}
//               >
//                 <h3 className="font-bold">{form.title}</h3>
//                 <p className="text-sm text-gray-500">
//                   Questions: {form.questions.length}
//                 </p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="p-4 border rounded">
//             <h3 className="text-xl font-bold mb-4">{selectedForm.title}</h3>
            
//             {selectedForm.questions.map(q => (
//               <div key={q.id} className="mb-4">
//                 <p className="font-medium mb-2">{q.question}</p>
                
//                 {q.type === 'MCQ' ? (
//                   <div>
//                     {q.options.map((option, index) => (
//                       <label key={index} className="block mb-2">
//                         <input
//                           type="radio"
//                           name={`question-${q.id}`}
//                           value={option}
//                           onChange={(e) => setResponses({
//                             ...responses,
//                             [q.id]: e.target.value
//                           })}
//                           className="mr-2"
//                         />
//                         {option}
//                       </label>
//                     ))}
//                   </div>
//                 ) : (
//                   <textarea
//                     value={responses[q.id] || ''}
//                     onChange={(e) => setResponses({
//                       ...responses,
//                       [q.id]: e.target.value
//                     })}
//                     className="w-full p-2 border rounded"
//                     rows="3"
//                   />
//                 )}
//               </div>
//             ))}
            
//             <div className="flex gap-4">
//               <button
//                 onClick={handleSubmit}
//                 className="bg-green-500 text-white px-4 py-2 rounded"
//               >
//                 Submit Response
//               </button>
//               <button
//                 onClick={() => {
//                   setSelectedForm(null);
//                   setResponses({});
//                 }}
//                 className="bg-gray-500 text-white px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

// export default UserDashboard;




import React, { useState } from 'react';

const UserDashboard = ({ forms, submitResponse }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [responses, setResponses] = useState({});

  // Handle input change for form responses
  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (formId) => {
    try {
      const responseData = {
        formId,
        timestamp: new Date().toISOString(),
        responses: responses
      };

      await submitResponse(formId, responseData);
      
      // Clear responses after successful submission
      setResponses({});
      setSelectedForm(null);
      alert('Response submitted successfully!');
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Available Feedback Forms</h1>
      
      {/* List of available forms */}
      <div className="space-y-4">
        {forms.map((form) => (
          <div 
            key={form.id} 
            className="border rounded-lg p-4 bg-white shadow"
          >
            <h2 className="text-xl font-bold mb-2">{form.title || `Form #${form.id}`}</h2>
            <p className="text-gray-600 mb-4">{form.description}</p>
            
            {selectedForm === form.id ? (
              <div className="space-y-4">
                {/* Render form questions */}
                {form.questions && form.questions.map((question, index) => (
                  <div key={index} className="mb-4">
                    <label className="block font-medium mb-2">
                      {question.text}
                    </label>
                    
                    {question.type === 'text' && (
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                        placeholder="Enter your answer"
                      />
                    )}
                    
                    {question.type === 'radio' && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label key={optIndex} className="flex items-center">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={responses[question.id] === option}
                              onChange={(e) => handleResponseChange(question.id, e.target.value)}
                              className="mr-2"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'select' && (
                      <select
                        className="w-full p-2 border rounded"
                        value={responses[question.id] || ''}
                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                      >
                        <option value="">Select an option</option>
                        {question.options.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
                
                {/* Submit and Cancel buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleSubmit(form.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit Response
                  </button>
                  <button
                    onClick={() => {
                      setSelectedForm(null);
                      setResponses({});
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSelectedForm(form.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Answer Form
              </button>
            )}
          </div>
        ))}
      </div>
      
      {forms.length === 0 && (
        <p className="text-center text-gray-500">No feedback forms available.</p>
      )}
    </div>
  );
};

export default UserDashboard;
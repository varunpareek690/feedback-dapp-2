import React,{useState} from "react";
function AdminDashboard({ createForm, forms, refreshForms }) {
    const [formTitle, setFormTitle] = useState('');
    const [questions, setQuestions] = useState([]);
  
    const addQuestion = (type) => {
      setQuestions([...questions, {
        id: Date.now(),
        type,
        question: '',
        options: type === 'MCQ' ? [''] : undefined
      }]);
    };
  
    const updateQuestion = (id, field, value) => {
      setQuestions(questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      ));
    };
  
    const handlePublish = async () => {
      const formData = {
        title: formTitle,
        questions,
        createdAt: new Date().toISOString()
      };
      await createForm(formData);
      setFormTitle('');
      setQuestions([]);
      refreshForms();
    };
  
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Create Feedback Form</h2>
        
        <input
          type="text"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Form Title"
          className="w-full p-2 mb-4 border rounded"
        />
  
        <div className="mb-4">
          <button 
            onClick={() => addQuestion('text')}
            className="mr-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Text Question
          </button>
          <button 
            onClick={() => addQuestion('MCQ')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add MCQ Question
          </button>
        </div>
  
        {questions.map((q) => (
          <div key={q.id} className="mb-4 p-4 border rounded">
            <input
              type="text"
              value={q.question}
              onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
              placeholder="Question"
              className="w-full p-2 mb-2 border rounded"
            />
            
            {q.type === 'MCQ' && (
              <div className="ml-4">
                {q.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...q.options];
                      newOptions[index] = e.target.value;
                      updateQuestion(q.id, 'options', newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="w-full p-2 mb-2 border rounded"
                  />
                ))}
                <button
                  onClick={() => updateQuestion(q.id, 'options', [...q.options, ''])}
                  className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                >
                  Add Option
                </button>
              </div>
            )}
          </div>
        ))}
  
        {questions.length > 0 && (
          <button
            onClick={handlePublish}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Publish Form
          </button>
        )}
  
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Published Forms</h3>
          {forms.map(form => (
            <div key={form.id} className="p-4 border rounded mb-4">
              <h4 className="font-bold">{form.title}</h4>
              <p className="text-sm text-gray-500">Created: {new Date(form.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

export default AdminDashboard;
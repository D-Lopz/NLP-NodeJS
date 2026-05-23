import {useState}from 'react';

function TaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <form className="bg-zinc-950 p-10"/>
      <input 
      type="text" 
      placeholder="title" 
      className="block py-2 px-3 mb-4 w-full text-black"
      onChange={(e) => setTitle(e.target.value)}
      />
      <textarea 
      placeholder="description" 
      className="block py-2 px-3 mb-4 w-full text-black">
      rows={3}
      </textarea>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Save</button>
    </div>
  );
}

export default TaskForm;
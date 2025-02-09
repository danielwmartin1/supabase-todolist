import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabase.js';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    fetchTodos();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        cancelEditing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    if (inputRef.current) {
      inputRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('is_completed', { ascending: true })
      .order('updated_at', { ascending: false });
    if (!error) setTodos(data);
  };

  const addTodo = async () => {
    if (newTodo.trim() === '') return;
    const { error } = await supabase
      .from('todos')
      .insert([{
        title: newTodo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    if (!error) {
      setNewTodo('');
      fetchTodos();
    }
  };

  const toggleCompletion = async (id, isCompleted) => {
    const { error } = await supabase
      .from('todos')
      .update({
        is_completed: !isCompleted,
        completed_at: !isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (!error) fetchTodos();
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) fetchTodos();
  };

  const startEditing = (todo) => {
    if (editingTodo !== null && editingTodo !== todo.id) {
      cancelEditing();
    }
    setEditingTodo(todo.id);
    setEditingText(todo.title);
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 0);
  };

  const cancelEditing = () => {
    setEditingTodo(null);
    setEditingText('');
  };

  const saveEdit = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo && todo.title === editingText) {
      cancelEditing();
      return;
    }
    const { error } = await supabase
      .from('todos')
      .update({
        title: editingText,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (!error) {
      setEditingTodo(null);
      setEditingText('');
      fetchTodos();
    }
  };

  const handleNewTodoKeyDown = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  const handleEditTodoKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    }
  };

  return (
    <div className="App">
      <div className="add-header">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleNewTodoKeyDown}
          placeholder="Add a new task"
          ref={inputRef}
        />
        <button id="add" onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {editingTodo === todo.id ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => handleEditTodoKeyDown(e, todo.id)}
                  ref={editInputRef}
                />
                <button id="save" onClick={() => saveEdit(todo.id)}>Save</button>
                <button id="cancel" onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                <span
                  onClick={() => toggleCompletion(todo.id, todo.is_completed)}
                  style={{
                    textDecoration: todo.is_completed ? 'line-through' : 'none',
                    opacity: todo.is_completed ? 0.5 : 1,
                    cursor: 'pointer'
                  }}
                >
                  {todo.title}
                </span>
                <div
                    style={{
                    textDecoration: todo.is_completed ? 'line-through' : 'none',
                    opacity: todo.is_completed ? 0.5 : 1,
                    cursor: 'pointer'
                  }}>
                  <small>Created at: {new Date(todo.created_at).toLocaleDateString()} @ {new Date(todo.created_at).toLocaleTimeString()}</small>
                </div>
                <div
                    style={{
                    textDecoration: todo.is_completed ? 'line-through' : 'none',
                    opacity: todo.is_completed ? 0.5 : 1,
                    cursor: 'pointer'
                  }}>
                  <small>Updated at: {new Date(todo.updated_at).toLocaleDateString()} @ {new Date(todo.updated_at).toLocaleTimeString()}</small>
                </div>
                {!todo.is_completed && <button id="edit" onClick={() => startEditing(todo)}>Edit</button>}
                <button id="delete" onClick={() => deleteTodo(todo.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    // Log the Supabase client instance to check if it is initialized
    console.log('Supabase client:', supabase);

    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
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
    setEditingTodo(todo.id);
    setEditingText(todo.title);
  };

  const cancelEditing = () => {
    setEditingTodo(null);
    setEditingText('');
  };

  const saveEdit = async (id) => {
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

  return (
    <div className="App">
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        placeholder="Add a new task"
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {editingTodo === todo.id ? (
              <>
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                />
                <button onClick={() => saveEdit(todo.id)}>Save</button>
                <button onClick={cancelEditing}>Cancel</button>
              </>
            ) : (
              <>
                <span
                  onClick={() => toggleCompletion(todo.id, todo.is_completed)}
                  style={{
                    textDecoration: todo.is_completed ? 'line-through' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  {todo.title}
                </span>
                <div>
                  <small>Created at: {new Date(todo.created_at).toLocaleDateString()} @ {new Date(todo.created_at).toLocaleTimeString()}</small>
                </div>
                <div>
                  <small>Updated at: {new Date(todo.updated_at).toLocaleDateString()} @ {new Date(todo.updated_at).toLocaleTimeString()}</small>
                </div>
                <button onClick={() => startEditing(todo)}>Edit</button>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
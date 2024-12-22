import { useEffect, useState } from 'react';
import { supabase } from './supabase';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setTodos(data);
    };
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim() === '') return;
    const { data, error } = await supabase
      .from('todos')
      .insert([{ title: newTodo }]);
    if (!error) setTodos([data[0], ...todos]);
    setNewTodo('');
  };

  const toggleCompletion = async (id, isCompleted) => {
    const { data, error } = await supabase
      .from('todos')
      .update({ is_completed: !isCompleted })
      .eq('id', id);
    if (!error) setTodos(todos.map(todo => (todo.id === id ? data[0] : todo)));
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>To-Do List</h1>
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
            <span
              onClick={() => toggleCompletion(todo.id, todo.is_completed)}
              style={{
                textDecoration: todo.is_completed ? 'line-through' : 'none',
                cursor: 'pointer'
              }}
            >
              {todo.title}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/todos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('updated_at', { ascending: false })
      .order('completed_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/todos', async (req, res) => {
  const { title } = req.body;
  try {
    const { error } = await supabase
      .from('todos')
      .insert([{
        title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);
    if (error) throw error;
    res.status(201).json({ message: 'Todo added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, is_completed } = req.body;
  try {
    const { error } = await supabase
      .from('todos')
      .update({
        title,
        is_completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Todo updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/todos/:id/completion', async (req, res) => {
  const { id } = req.params;
  const { is_completed } = req.body;
  try {
    const { error } = await supabase
      .from('todos')
      .update({
        is_completed,
        completed_at: is_completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Todo completion status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
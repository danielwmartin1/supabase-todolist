import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { test, expect } from '@jest/globals';
import App from './App';

test('adds a new todo when Enter key is pressed', async () => {
  render(<App />);

  const input = screen.getByPlaceholderText('Add a new task');
  fireEvent.change(input, { target: { value: 'New Todo' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

  const newTodo = await screen.findByText('New Todo');
  expect(newTodo).toBeInTheDocument();
});
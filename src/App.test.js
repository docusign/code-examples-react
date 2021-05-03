import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';
import ReactDOM from 'react-dom';

test('renders login button', () => {
  render(<App />);
  const loginEls = screen.getAllByText(/Login/i);
  //expect(linkElement).toBeInTheDocument();
  expect(loginEls.length).toEqual(2);
});

it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
  
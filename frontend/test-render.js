import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './src/App.jsx';

try {
  const { container } = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  console.log("RENDER SUCCESS!");
} catch (error) {
  console.error("RENDER ERROR:", error);
}

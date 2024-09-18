import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import "./index.css";
const root = document.getElementById('root');

// Use createRoot from "react-dom/client" instead of ReactDOM.createRoot
const rootInstance = createRoot(root);

// Wrap your App component in a root instance
rootInstance.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

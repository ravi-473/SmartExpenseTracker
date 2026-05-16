// src/main.jsx - Application Entry Point
// This is the first React file that runs.
// It mounts the App component into the #root div in index.html.

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

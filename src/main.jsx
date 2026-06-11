import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Ensure global errors are caught
window.addEventListener('error', (event) => {
  document.body.innerHTML = `<div style="color:red;padding:20px;"><h1>Global Error</h1><pre>${event.error?.stack || event.message}</pre></div>`;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            },
            success: {
              style: { background: '#f0fdf6', color: '#15803d', border: '1px solid #bbf7d4' },
              iconTheme: { primary: '#1a9e5c', secondary: '#fff' },
            },
            error: {
              style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

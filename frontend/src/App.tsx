import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { socketService } from './services/socketService';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { AppRoutes } from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
};

const AppContent: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketService.initialize(user.id);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <AppRoutes />
      </main>
    </div>
  );
};

export default App; 
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { CatalogPage } from './pages/CatalogPage';
import { CarDetailsPage } from './pages/CarDetailsPage';
import { CreateCarPage } from './pages/CreateCarPage';
import { EditCarPage } from './pages/EditCarPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { MyCarsPage } from './pages/MyCarsPage';
import { AdminPage } from './pages/AdminPage';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-darkbg-900 text-slate-800 dark:text-slate-100 transition-colors">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<CatalogPage />} />
                <Route path="/cars/:id" element={<CarDetailsPage />} />
                
                <Route
                  path="/cars/create"
                  element={
                    <ProtectedRoute>
                      <CreateCarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cars/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditCarPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-cars"
                  element={
                    <ProtectedRoute>
                      <MyCarsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <ChatPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Admin Only */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

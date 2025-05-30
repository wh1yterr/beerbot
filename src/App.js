import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import AgeVerificationModal from './components/AgeVerificationModal';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart'; // Добавьте этот импорт
import Profile from './pages/Profile';
import TermsPage from './pages/TermsPage';

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <AgeVerificationModal />
        <Header />
        
        {/* Основной контент */}
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/terms" element={<TermsPage />} />
          </Routes>
        </main>
        
        {/* Футер */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
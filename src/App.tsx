import './App.css';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { ResourcesPage } from './pages/Resources';
import ResourceDetailPage from './pages/ResourceDetail';
import { MyBookingsPage } from './pages/MyBookings';
import { BookingProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <BookingProvider>
        <div className="App">
          <BrowserRouter>
            <Header />
            <main className="App-main">
              <Routes>
                <Route path="/" element={<Navigate to="/resources" replace />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/resources/:resourceId" element={<ResourceDetailPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
              </Routes>
            </main>
          </BrowserRouter>
        </div>
      </BookingProvider>
    </NotificationProvider>
  );
}

export default App;

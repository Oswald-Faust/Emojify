import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './src/context/AppContext';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { AuthView } from './components/AuthView';
import { Studio } from './components/Studio';
import { GalleryView } from './components/GalleryView';
import { PricingView } from './components/PricingView';
import { ProfileView } from './components/ProfileView';
import { EditProfileView } from './components/EditProfileView';
import { SecurityView } from './components/SecurityView';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthView />} />
          
          {/* App Layout Routes */}
          <Route element={<Layout />}>
            <Route path="/app" element={<Studio mode="image" />} />
            <Route path="/motion" element={<Studio mode="video" />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/pricing" element={<PricingView />} />
            <Route path="/profile" element={<ProfileView />} />
            <Route path="/profile/edit" element={<EditProfileView />} />
            <Route path="/profile/security" element={<SecurityView />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};



export default App;

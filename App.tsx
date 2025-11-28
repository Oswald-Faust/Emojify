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
import { BlogView } from './components/BlogView';
import { TutorialsView } from './components/TutorialsView';
import { HelpCenterView } from './components/HelpCenterView';
import { PrivacyView } from './components/PrivacyView';
import { TermsView } from './components/TermsView';
import { LegalView } from './components/LegalView';
import { AdminBlogView } from './components/AdminBlogView';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthView />} />
          
          {/* Public Pages */}
          <Route path="/blog" element={<BlogView />} />
          <Route path="/tutorials" element={<TutorialsView />} />
          <Route path="/help" element={<HelpCenterView />} />
          <Route path="/privacy" element={<PrivacyView />} />
          <Route path="/terms" element={<TermsView />} />
          <Route path="/legal" element={<LegalView />} />
          
          {/* Admin Pages */}
          <Route path="/admin/blog" element={<AdminBlogView />} />
          
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

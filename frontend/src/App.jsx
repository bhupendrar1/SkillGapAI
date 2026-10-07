import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import InputPage from './pages/InputPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AuthModal from './components/AuthModal';
import PaymentModal from './components/PaymentModal';
import ChatbotWidget from './components/ChatbotWidget';

import { analyzeSkills, checkHealth, getMe, logoutUser } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'input' | 'results' | 'profile' | 'admin'
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Auth & Modals State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Check backend health & auto-login if token exists
  useEffect(() => {
    let isMounted = true;
    const testBackend = async () => {
      const res = await checkHealth();
      if (isMounted) {
        setBackendStatus(res.success ? 'online' : 'offline');
      }
    };
    testBackend();
    const interval = setInterval(testBackend, 15000);

    // Load active session user if token stored
    const token = localStorage.getItem('token');
    if (token) {
      getMe().then((res) => {
        if (isMounted && res.success) {
          setCurrentUser(res.data);
        }
      });
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStartAnalysis = () => {
    setError(null);
    setCurrentPage('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    setError(null);

    const res = await analyzeSkills(formData);

    setIsLoading(false);

    if (res.success) {
      setResults(res.data);
      setCurrentPage('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setError(res.error);
    }
  };

  const handleNewAnalysis = () => {
    setError(null);
    setCurrentPage('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page) => {
    setError(null);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    if (currentPage === 'profile' || currentPage === 'admin') {
      setCurrentPage('home');
    }
  };

  const handleSelectPastAnalysis = (pastItem) => {
    // Transform history item into full results schema if needed
    setResults({
      target_role: pastItem.target_role,
      resume_source: pastItem.resume_source,
      overall_match: pastItem.overall_match,
      matched_skills: pastItem.matched_skills || [],
      partial_skills: pastItem.partial_skills || [],
      missing_skills: pastItem.missing_skills || [],
      skill_analysis: pastItem.skill_analysis || [],
      recommendations: pastItem.recommendations || [],
      stats: {
        total: (pastItem.matched_skills?.length || 0) + (pastItem.partial_skills?.length || 0) + (pastItem.missing_skills?.length || 0),
        matched: pastItem.matched_skills?.length || 0,
        partial: pastItem.partial_skills?.length || 0,
        missing: pastItem.missing_skills?.length || 0,
      }
    });
    setCurrentPage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        backendStatus={backendStatus}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentPage === 'home' && (
          <HomePage onStartAnalysis={handleStartAnalysis} />
        )}

        {currentPage === 'input' && (
          <InputPage
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
            clearError={() => setError(null)}
          />
        )}

        {currentPage === 'results' && (
          <ResultsPage
            results={results}
            onNewAnalysis={handleNewAnalysis}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onSelectPastAnalysis={handleSelectPastAnalysis}
            onOpenUpgradeModal={() => setIsPaymentModalOpen(true)}
          />
        )}

        {currentPage === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* Floating AI Coach Chatbot Widget */}
      <ChatbotWidget
        analysisContext={results}
        currentUser={currentUser}
      />

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => setCurrentUser(user)}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentPlan={currentUser?.plan || 'free'}
        onUpgradeSuccess={(newPlan) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, plan: newPlan });
          }
        }}
      />

      <Footer />
    </div>
  );
}

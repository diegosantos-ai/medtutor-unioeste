
import React, { useState, useEffect } from 'react';
import { UserProfile, WeeklyPlan } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import TutorChat from './components/TutorChat';
import StudyResources from './components/StudyResources';
import ProgressTracker from './components/ProgressTracker';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [view, setView] = useState<'dashboard' | 'chat' | 'resources' | 'progress'>('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('medtutor_profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
    const savedPlan = localStorage.getItem('medtutor_plan');
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile, newPlan: WeeklyPlan) => {
    setProfile(newProfile);
    setPlan(newPlan);
    localStorage.setItem('medtutor_profile', JSON.stringify(newProfile));
    localStorage.setItem('medtutor_plan', JSON.stringify(newPlan));
  };

  if (!profile || !profile.hasOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout currentView={view} setView={setView} userName={profile.name}>
      {view === 'dashboard' && <Dashboard plan={plan} profile={profile} onUpdatePlan={(p) => {
          setPlan(p);
          localStorage.setItem('medtutor_plan', JSON.stringify(p));
      }} />}
      {view === 'chat' && <TutorChat profile={profile} />}
      {view === 'resources' && <StudyResources profile={profile} />}
      {view === 'progress' && <ProgressTracker profile={profile} />}
    </Layout>
  );
};

export default App;

import { useAuth } from '@/hooks/useAuth';
import { useManagers } from '@/hooks/useManagers';
import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const auth = useAuth();
  const managersHook = useManagers();

  if (!auth.isLoggedIn) {
    return (
      <LoginScreen
        attemptsLeft={auth.attemptsLeft}
        isBlocked={auth.isBlocked}
        blockMinutesLeft={auth.blockMinutesLeft}
        onAdminLogin={auth.loginAsAdmin}
        onManagerLogin={auth.loginAsManager}
        onFailedAttempt={auth.handleFailedAttempt}
        validateManager={managersHook.validateManagerLogin}
      />
    );
  }

  return (
    <Dashboard 
      timeLeft={auth.timeLeft} 
      onLogout={auth.logout}
      isAdmin={auth.isAdmin}
      managerId={auth.managerId}
      managersHook={managersHook}
    />
  );
};

export default Index;

import { useAuth } from '@/hooks/useAuth';
import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const { isLoggedIn, timeLeft, attemptsLeft, isBlocked, blockMinutesLeft, login, logout } = useAuth();

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={login}
        attemptsLeft={attemptsLeft}
        isBlocked={isBlocked}
        blockMinutesLeft={blockMinutesLeft}
      />
    );
  }

  return <Dashboard timeLeft={timeLeft} onLogout={logout} />;
};

export default Index;

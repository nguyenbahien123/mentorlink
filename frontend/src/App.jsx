import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { AuthProvider, ThemeProvider, useAuth } from "./contexts";
import { AuthLoader } from "./components/auth";
import routes from "./routes";
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import { ToastProvider } from './contexts/ToastContext';
import ChatbotWidget from './components/common/ChatbotWidget';
import UserChatBox from './components/common/UserChatBox';
import AdminChatPanel from './components/admin/AdminChatPanel';

const queryClient = new QueryClient();

const ADMIN_EMAIL = 'vuhongthu13062004@gmail.com';

// Component để kiểm tra loading state
const AppContent = () => {
  const { loading, isLoggedIn, user } = useAuth();

  if (loading) {
    return <AuthLoader />;
  }

  return (
    <>
      <RouterProvider router={routes} />
      <ChatbotWidget />
      
      {/* Hiển thị chat box cho user đã đăng nhập (không phải admin) */}
      {isLoggedIn && user && user.email !== ADMIN_EMAIL && (
        <UserChatBox 
          userEmail={user.email} 
          userName={user.email}
        />
      )}
      
      {/* Hiển thị admin chat panel cho admin */}
      {isLoggedIn && user && user.email === ADMIN_EMAIL && (
        <AdminChatPanel />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './global/AppLayout'
import Chat from '@/pages/Chat'
import Completion from './pages/Completion'
import NotFoundPage from '@/pages/NotFoundPage'
import LoginForm from './pages/Login'
import './App.css'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("idToken"); // Check if user is authenticated
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/" element={<Navigate to="/login" />} />
      
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/completion" element={<Completion />} /> 
        <Route path="/completion/:id" element={<Completion />} />
      </Route>
      
      <Route path="/*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App 

import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import ProcessPage from "./pages/ProcessPage";
import UserPage from "./pages/UserPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";

function AuthToastListener() {
  const { isSignedIn, user, isLoaded } = useUser();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Wait for Clerk to finish loading authentication state
    if (!isLoaded) {
      return;
    }

    // On first load after Clerk is ready, just mark as initialized
    // Don't show toast for existing sessions on page refresh
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      // Store the current auth state in sessionStorage to prevent toast on refresh
      if (isSignedIn && user) {
        sessionStorage.setItem('auth_initialized', 'true');
      }
      return;
    }

    // Only show toast if this is a NEW login (not already initialized in this session)
    const wasAlreadyInitialized = sessionStorage.getItem('auth_initialized') === 'true';

    if (isSignedIn && user && !wasAlreadyInitialized) {
      const isNewUser = user.createdAt && user.updatedAt && user.createdAt.getTime() === user.updatedAt.getTime();
      toast.success(isNewUser ? "Signup successful — welcome!" : "Logged in successfully.");
      sessionStorage.setItem('auth_initialized', 'true');
    }
  }, [isLoaded, isSignedIn, user]);

  // Clear the flag when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      sessionStorage.removeItem('auth_initialized');
    }
  }, [isLoaded, isSignedIn]);

  return null;
}

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />}/>
      <Route path="/process/:id" element={<ProcessPage />} />
      <Route path="/explore" element={<ExplorePage />}/>
      <Route path="/user/:id" element={<UserPage />} />
      <Route path="/matches" element={<MatchesPage />} />
      <Route path="/chat" element={<ChatPage />} />
    </Routes>

    <AuthToastListener />

    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          minWidth: '300px',
        },
      }}
      containerStyle={{
        top: 90, 
        left: 20,  
      }}
    />
    </>

  );
}

export default App;

// tailwind, daisyui, react-router, react-hot-toast
// react-query aka tanstack query, axios
//        (to fetch query)
// https://tanstack.com/query/latest
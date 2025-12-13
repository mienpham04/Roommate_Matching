import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import ProcessPage from "./pages/ProcessPage";
import UserPage from "./pages/UserPage";
import MatchesPage from "./pages/MatchesPage";
import ChatPage from "./pages/ChatPage";

function AuthToastListener() {
  const { isSignedIn, user } = useUser();
  const hasShownRef = useRef(false);
  const prevSignedInRef = useRef(false);

  useEffect(() => {
    // Signup/Login success
    if (isSignedIn && user && !hasShownRef.current) {
      const isNewUser = user.createdAt && user.updatedAt && user.createdAt.getTime() === user.updatedAt.getTime();
      toast.success(isNewUser ? "Signup successful — welcome!" : "Logged in successfully.");
      hasShownRef.current = true;
    }
    prevSignedInRef.current = !!isSignedIn;
  }, [isSignedIn, user]);

  return null;
}

function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />}/>
      <Route path="/profile/view/:id" element={<ProfilePage />}/>
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
import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import CreateProfilePage from "./pages/CreateProfilePage";

function App() {
  
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />}/>
      <Route path="/profile/view/:id" element={<ProfilePage />}/>
      <Route path="/profile/create" element={<CreateProfilePage />} />
      <Route path="/explore" element={<ExplorePage />}/>
    </Routes>

    <Toaster toastOptions={{ duration: 3000 }}/>
    </>
    
  );
}

export default App;

// tailwind, daisyui, react-router, react-hot-toast
// react-query aka tanstack query, axios
//        (to fetch query)
// https://tanstack.com/query/latest
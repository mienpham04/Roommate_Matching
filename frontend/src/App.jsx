import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import ProcessPage from "./pages/ProcessPage";
import Test from "./pages/Test";

function App() {
  
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />}/>
      <Route path="/profile/view/:id" element={<ProfilePage />}/>
      <Route path="/process" element={<ProcessPage />} />
      <Route path="/explore" element={<ExplorePage />}/>
      <Route path="/test" element={<Test />}/>
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
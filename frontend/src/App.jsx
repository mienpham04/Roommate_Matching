import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />}/>
      <Route path="/profile/:id" element={<ProfilePage />}/>

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
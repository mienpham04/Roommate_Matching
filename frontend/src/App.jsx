import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ExplorePage from "./pages/ExplorePage";
import ProcessPage from "./pages/ProcessPage";
import UserPage from "./pages/UserPage";
import MatchesPage from "./pages/MatchesPage";

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
    </Routes>

    <Toaster
      toastOptions={{
        duration: 3000,
        style: {
          minWidth: '250px',
        }
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
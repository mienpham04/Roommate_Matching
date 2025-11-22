import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}/>
      <Route path="/profile/:id" element={<ProfilePage />}/>

    </Routes>
  );
}

export default App;

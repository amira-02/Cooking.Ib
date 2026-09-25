import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Products from "./pages/Products";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
          <Link to="/">Produits</Link>
          <Link to="/login">Connexion</Link>
          <Link to="/register">Inscription</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
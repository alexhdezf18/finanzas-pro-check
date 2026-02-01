import { useState } from "react";
import { login } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token); // 💾 Guardamos token
      alert("Bienvenido " + data.user.name);
      navigate("/"); // Redirigir al Dashboard
    } catch (error) {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Correo"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-black text-white py-2 rounded font-bold hover:bg-gray-800">
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-500 font-bold">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}

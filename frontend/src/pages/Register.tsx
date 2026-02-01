import { useState } from "react";
import { register } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      alert("¡Cuenta creada! Ahora inicia sesión.");
      navigate("/login");
    } catch (error) {
      alert("Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            placeholder="Contraseña (min 6 chars)"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">
            Registrarme
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-blue-500 font-bold">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

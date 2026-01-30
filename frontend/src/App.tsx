import { useEffect, useState } from "react";
import * as categoriesApi from "./api/categories";
import * as transactionsApi from "./api/transactions";
import type { Category, Transaction } from "./types";

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para nueva Transacción
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number | "">("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  // Cargar datos al inicio
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargamos ambas cosas en paralelo
      const [catsData, transData] = await Promise.all([
        categoriesApi.getCategories(),
        transactionsApi.getTransactions(),
      ]);
      setCategories(catsData);
      setTransactions(transData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !amount || !concept) return;

    try {
      const newTransaction = await transactionsApi.createTransaction({
        amount: parseFloat(amount),
        concept,
        date: new Date().toISOString(), // Usamos fecha actual por ahora
        type,
        categoryId: Number(selectedCatId),
      });

      setTransactions([newTransaction, ...transactions]); // Agregamos al principio

      // Limpiar form
      setAmount("");
      setConcept("");
      setSelectedCatId("");
    } catch (error) {
      alert("Error guardando transacción");
      console.error(error);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm("¿Borrar movimiento?")) return;
    try {
      await transactionsApi.deleteTransaction(id);
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* COLUMNA IZQUIERDA: Formulario */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Registrar Movimiento</h2>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              {/* Tipo (Ingreso / Gasto) */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setType("EXPENSE")}
                  className={`flex-1 py-2 rounded-md font-medium transition ${
                    type === "EXPENSE"
                      ? "bg-red-100 text-red-600 shadow-sm"
                      : "text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  Gasto 📉
                </button>
                <button
                  type="button"
                  onClick={() => setType("INCOME")}
                  className={`flex-1 py-2 rounded-md font-medium transition ${
                    type === "INCOME"
                      ? "bg-green-100 text-green-600 shadow-sm"
                      : "text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  Ingreso 📈
                </button>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-3 border rounded-lg text-2xl font-bold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Concepto */}
              <input
                type="text"
                placeholder="¿En qué gastaste?"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
              />

              {/* Categoría */}
              <select
                className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(Number(e.target.value))}
              >
                <option value="">Selecciona Categoría...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!selectedCatId || !amount}
                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50"
              >
                Guardar Movimiento
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: Historial */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Historial Reciente</h2>

          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {t.category?.icon || "📄"}
                    </div>
                    <div>
                      <p className="font-bold">{t.concept}</p>
                      <p className="text-xs text-gray-500">
                        {t.category?.name} •{" "}
                        {new Date(t.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}$
                      {Number(t.amount).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDeleteTransaction(t.id)}
                      className="text-xs text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="text-center text-gray-400 py-10 border-2 border-dashed rounded-xl">
                  No hay movimientos aún 🍃
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

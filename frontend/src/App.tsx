import { useEffect, useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import * as categoriesApi from "./api/categories";
import * as transactionsApi from "./api/transactions";
import type { Category, Transaction } from "./types";

// Colores para la gráfica (puedes cambiarlos)
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number | "">("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cats, trans] = await Promise.all([
        categoriesApi.getCategories(),
        transactionsApi.getTransactions(),
      ]);
      setCategories(cats);
      setTransactions(trans);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- 🧠 CÁLCULOS MATEMÁTICOS ---
  // Usamos useMemo para que no recalcule si no cambian las transacciones
  const { totalIncome, totalExpense, balance, chartData } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expensesByCategory: Record<string, number> = {};

    transactions.forEach((t) => {
      const val = Number(t.amount);
      if (t.type === "INCOME") {
        income += val;
      } else {
        expense += val;
        // Agrupar para la gráfica
        const catName = t.category?.name || "Otros";
        expensesByCategory[catName] = (expensesByCategory[catName] || 0) + val;
      }
    });

    // Convertir objeto a array para Recharts
    const data = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      chartData: data,
    };
  }, [transactions]);

  // --- MANEJADORES ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !amount || !concept) return;
    try {
      const newTx = await transactionsApi.createTransaction({
        amount: parseFloat(amount),
        concept,
        date: new Date().toISOString(),
        type,
        categoryId: Number(selectedCatId),
      });
      setTransactions([newTx, ...transactions]);
      setAmount("");
      setConcept("");
    } catch (error) {
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar?")) return;
    await transactionsApi.deleteTransaction(id);
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  if (loading)
    return (
      <div className="p-10 text-center">Cargando cerebro financiero... 🧠</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* --- SECCIÓN 1: TARJETAS DE RESUMEN --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Ingresos Totales</p>
            <p className="text-2xl font-bold text-green-600">
              +${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">Gastos Totales</p>
            <p className="text-2xl font-bold text-red-600">
              -${totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">Balance Final</p>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}
            >
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* --- SECCIÓN 2: GRÁFICA Y FORMULARIO --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA IZQUIERDA: Gráfica + Formulario */}
          <div className="lg:col-span-1 space-y-6">
            {/* Gráfica */}
            <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center">
              <h3 className="font-bold mb-4 text-gray-700">
                Gastos por Categoría
              </h3>
              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value?: number) => [`$${value}`, "Monto"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                  Registra gastos para ver la gráfica 📊
                </div>
              )}
            </div>

            {/* Formulario */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-bold mb-4">Nuevo Movimiento</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType("EXPENSE")}
                    className={`flex-1 py-2 rounded text-sm font-bold ${type === "EXPENSE" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("INCOME")}
                    className={`flex-1 py-2 rounded text-sm font-bold ${type === "INCOME" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    Ingreso
                  </button>
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full p-2 border rounded text-lg font-bold text-center"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Concepto"
                  className="w-full p-2 border rounded"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                />
                <select
                  className="w-full p-2 border rounded bg-white"
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(Number(e.target.value))}
                >
                  <option value="">Categoría...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!amount || !selectedCatId}
                  className="w-full bg-black text-white py-2 rounded font-bold disabled:opacity-50"
                >
                  Guardar
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA: Historial (Más ancha ahora) */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Historial de Movimientos</h2>
            <div className="space-y-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl">
                      {t.category?.icon || "📄"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{t.concept}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(t.date).toLocaleDateString()} •{" "}
                        {t.category?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}$
                      {Number(t.amount).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs text-red-400 hover:text-red-600 underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-center text-gray-400 mt-10">
                  No hay datos aún.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

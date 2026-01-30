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
import type { Category, Transaction, CreateTransactionData } from "./types";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<number | "">("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 🔥 NUEVO: Estados para el Filtro de Fecha
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth()); // 0 = Enero
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

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

  // 🔥 NUEVO: Primero filtramos las transacciones según lo que el usuario eligió
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Ajustamos la fecha para evitar problemas de zona horaria simples
      const tDate = new Date(t.date);
      // Ojo: getMonth() devuelve 0-11, getFullYear() el año completo
      return (
        tDate.getMonth() === filterMonth && tDate.getFullYear() === filterYear
      );
    });
  }, [transactions, filterMonth, filterYear]);

  // 🔥 ACTUALIZADO: Ahora calculamos los totales usando 'filteredTransactions' en vez de todas
  const { totalIncome, totalExpense, balance, chartData } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expensesByCategory: Record<string, number> = {};

    filteredTransactions.forEach((t) => {
      const val = Number(t.amount);
      if (t.type === "INCOME") {
        income += val;
      } else {
        expense += val;
        const catName = t.category?.name || "Otros";
        expensesByCategory[catName] = (expensesByCategory[catName] || 0) + val;
      }
    });

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
  }, [filteredTransactions]); // Dependencia actualizada

  // ... (Funciones handleEditClick, handleCancelEdit igual que antes)
  const handleEditClick = (t: Transaction) => {
    setEditingId(t.id);
    setAmount(String(t.amount));
    setConcept(t.concept);
    setSelectedCatId(t.categoryId);
    setType(t.type);
    setDate(new Date(t.date).toISOString().split("T")[0]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAmount("");
    setConcept("");
    setSelectedCatId("");
    setType("EXPENSE");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !amount || !concept || !date) return;

    const dataPayload: CreateTransactionData = {
      // Tipado explícito ayuda
      amount: parseFloat(amount),
      concept,
      date: new Date(date).toISOString(),
      type,
      categoryId: Number(selectedCatId),
    };

    try {
      if (editingId) {
        const updatedTx = await transactionsApi.updateTransaction(
          editingId,
          dataPayload,
        );
        setTransactions(
          transactions.map((t) => (t.id === editingId ? updatedTx : t)),
        );
      } else {
        const newTx = await transactionsApi.createTransaction(dataPayload);
        setTransactions([newTx, ...transactions]);
      }
      handleCancelEdit();
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Borrar?")) return;
    await transactionsApi.deleteTransaction(id);
    setTransactions(transactions.filter((t) => t.id !== id));
    if (editingId === id) handleCancelEdit();
  };

  if (loading) return <div className="p-10 text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ENCABEZADO Y FILTROS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Panel Financiero</h1>

          {/* 🔥 NUEVO: Selector de Fecha */}
          <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
            <select
              className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer"
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <span className="text-gray-300">|</span>
            <select
              className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer"
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>

        {/* RESUMEN (Ahora muestra datos filtrados) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">
              Ingresos ({MONTHS[filterMonth]})
            </p>
            <p className="text-2xl font-bold text-green-600">
              +${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
            <p className="text-gray-500 text-sm">
              Gastos ({MONTHS[filterMonth]})
            </p>
            <p className="text-2xl font-bold text-red-600">
              -${totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">
              Balance ({MONTHS[filterMonth]})
            </p>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}
            >
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* IZQUIERDA: GRÁFICA + FORMULARIO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm h-72 flex flex-col">
              <h3 className="font-bold mb-2 text-gray-700 text-center text-sm">
                Gastos de {MONTHS[filterMonth]}
              </h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value?: number) => [`$${value}`, "Monto"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                  Sin gastos este mes
                </div>
              )}
            </div>

            {/* FORMULARIO (Sin cambios mayores) */}
            <div
              className={`bg-white p-6 rounded-xl shadow-sm border-2 ${editingId ? "border-yellow-400" : "border-transparent"} transition-colors`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">
                  {editingId ? "✏️ Editando" : "Nuevo Movimiento"}
                </h2>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-xs underline"
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <input
                  type="date"
                  required
                  className="w-full p-2 border rounded bg-gray-50"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
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
                  className={`w-full text-white py-2 rounded font-bold disabled:opacity-50 ${editingId ? "bg-yellow-500" : "bg-black"}`}
                >
                  {editingId ? "Actualizar" : "Guardar"}
                </button>
              </form>
            </div>
          </div>

          {/* DERECHA: HISTORIAL FILTRADO */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">
              Movimientos de {MONTHS[filterMonth]}
            </h2>
            <div className="space-y-3">
              {/* OJO: Aquí iteramos sobre 'filteredTransactions', no sobre todas */}
              {filteredTransactions.map((t) => (
                <div
                  key={t.id}
                  className={`bg-white p-4 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition border ${editingId === t.id ? "border-yellow-400 bg-yellow-50" : "border-transparent"}`}
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
                  <div className="flex flex-col items-end gap-1">
                    <p
                      className={`font-bold text-lg ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                    >
                      {t.type === "INCOME" ? "+" : "-"}$
                      {Number(t.amount).toFixed(2)}
                    </p>
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <p className="text-center text-gray-400 mt-10">
                  No hay movimientos en este mes.
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

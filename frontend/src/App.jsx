import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  Plus, Wallet, TrendingUp, TrendingDown, X, IndianRupee,
  LayoutDashboard, List, Target, ChevronDown, Trash2, Edit3,
  ArrowUpCircle, ArrowDownCircle, Sparkles, AlertCircle, Check
} from "lucide-react";

// ─── Seed Data ───────────────────────────────────────────────────────────────
const CATEGORIES = ["Food","Transport","Education","Entertainment","Utilities","Health","Shopping","Others"];
const CAT_COLORS = {
  Food:"#00B4D8", Transport:"#0077B6", Education:"#F59E0B",
  Entertainment:"#8B5CF6", Utilities:"#10B981", Health:"#EF4444",
  Shopping:"#EC4899", Others:"#64748B"
};
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const seedTxns = [
  { id:1, type:"income",  amount:15000, category:"Income",       description:"Monthly stipend",       date:"2026-04-01" },
  { id:2, type:"expense", amount:3200,  category:"Food",         description:"Mess + canteen",        date:"2026-04-03" },
  { id:3, type:"expense", amount:850,   category:"Transport",    description:"Bus pass + auto",       date:"2026-04-05" },
  { id:4, type:"expense", amount:1200,  category:"Education",    description:"Stationery & books",    date:"2026-04-07" },
  { id:5, type:"expense", amount:600,   category:"Entertainment",description:"OTT + movies",          date:"2026-04-09" },
  { id:6, type:"expense", amount:700,   category:"Utilities",    description:"Mobile recharge + wifi",date:"2026-04-11" },
  { id:7, type:"income",  amount:3000,  category:"Income",       description:"Part-time tutoring",    date:"2026-04-12" },
  { id:8, type:"expense", amount:900,   category:"Health",       description:"Medicines + gym",       date:"2026-04-14" },
  { id:9, type:"expense", amount:1500,  category:"Shopping",     description:"Clothes & accessories", date:"2026-04-16" },
  { id:10,type:"expense", amount:400,   category:"Others",       description:"Miscellaneous",         date:"2026-04-18" },
];

const seedBudgets = {
  Food:4000, Transport:1200, Education:2000,
  Entertainment:800, Utilities:1000, Health:1500, Shopping:2000, Others:600
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
let nextId = 100;

// ─── Components ──────────────────────────────────────────────────────────────
function KPICard({ label, value, icon: Icon, color, sub }) {
  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:"20px 24px",
      boxShadow:"0 2px 16px rgba(0,0,0,0.07)", borderLeft:`4px solid ${color}`,
      display:"flex", flexDirection:"column", gap:6
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:13, color:"#64748B", fontWeight:500 }}>{label}</span>
        <div style={{
          width:36, height:36, borderRadius:10,
          background:color+"18", display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <div style={{ fontSize:26, fontWeight:700, color:"#0A2540", letterSpacing:"-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"#94A3B8" }}>{sub}</div>}
    </div>
  );
}

function BudgetBar({ category, limit, spent }) {
  const pct = Math.min((spent / limit) * 100, 100);
  const color = pct >= 90 ? "#EF4444" : pct >= 70 ? "#F59E0B" : CAT_COLORS[category] || "#00B4D8";
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:13 }}>
        <span style={{ fontWeight:600, color:"#1E293B" }}>{category}</span>
        <span style={{ color:"#64748B" }}>{fmt(spent)} / {fmt(limit)}</span>
      </div>
      <div style={{ height:8, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`, background:color,
          borderRadius:99, transition:"width 0.5s ease"
        }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:3, fontSize:11, color:"#94A3B8" }}>
        <span>{pct.toFixed(0)}% used</span>
        <span style={{ color: pct >= 90 ? "#EF4444" : "#10B981" }}>
          {pct >= 100 ? "⚠ Exceeded!" : `${fmt(limit - spent)} left`}
        </span>
      </div>
    </div>
  );
}

function AddModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ type:"expense", amount:"", category:"Food", description:"", date: new Date().toISOString().split("T")[0] });
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      setError("Please enter a valid amount"); return;
    }
    onAdd({ ...form, amount: parseFloat(form.amount), id: ++nextId });
    onClose();
  };

  const inputStyle = {
    width:"100%", padding:"10px 14px", borderRadius:10, border:"1px solid #E2E8F0",
    fontSize:14, outline:"none", background:"#F8FAFC", boxSizing:"border-box",
    fontFamily:"inherit", color:"#1E293B"
  };
  const labelStyle = { fontSize:13, fontWeight:600, color:"#374151", marginBottom:4, display:"block" };

  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(10,37,64,0.55)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16
    }}>
      <div style={{
        background:"#fff", borderRadius:20, padding:"28px 28px",
        width:"100%", maxWidth:440, boxShadow:"0 20px 60px rgba(0,0,0,0.2)"
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ margin:0, fontSize:20, fontWeight:700, color:"#0A2540" }}>Add Transaction</h3>
          <button onClick={onClose} style={{ background:"#F1F5F9", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer" }}>
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Type Toggle */}
        <div style={{ display:"flex", background:"#F1F5F9", borderRadius:12, padding:4, marginBottom:18 }}>
          {["expense","income"].map(t => (
            <button key={t} onClick={() => setForm(f=>({...f,type:t}))} style={{
              flex:1, padding:"9px 0", borderRadius:9, border:"none", cursor:"pointer",
              fontWeight:600, fontSize:14, transition:"all 0.2s",
              background: form.type===t ? (t==="income"?"#10B981":"#EF4444") : "transparent",
              color: form.type===t ? "#fff" : "#64748B"
            }}>
              {t==="income" ? "💰 Income" : "💸 Expense"}
            </button>
          ))}
        </div>

        <div style={{ display:"grid", gap:14 }}>
          <div>
            <label style={labelStyle}>Amount (₹)</label>
            <input type="number" placeholder="0.00" value={form.amount}
              onChange={e => { setForm(f=>({...f,amount:e.target.value})); setError(""); }}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inputStyle}>
              {(form.type==="income" ? ["Income","Freelance","Others"] : CATEGORIES).map(c =>
                <option key={c}>{c}</option>
              )}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input type="text" placeholder="e.g. Lunch at canteen"
              value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={form.date}
              onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={inputStyle} />
          </div>
        </div>

        {error && (
          <div style={{ marginTop:12, padding:"8px 12px", background:"#FEF2F2", borderRadius:8, display:"flex", gap:8, alignItems:"center" }}>
            <AlertCircle size={15} color="#EF4444" />
            <span style={{ fontSize:13, color:"#EF4444" }}>{error}</span>
          </div>
        )}

        <button onClick={handleSubmit} style={{
          marginTop:20, width:"100%", padding:"12px 0", borderRadius:12,
          background: form.type==="income" ? "#10B981" : "#0077B6",
          color:"#fff", border:"none", fontSize:15, fontWeight:700, cursor:"pointer",
          letterSpacing:"0.3px"
        }}>
          Add {form.type === "income" ? "Income" : "Expense"}
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function BudgetWise() {
  const [tab, setTab] = useState("dashboard");
  const [transactions, setTransactions] = useState(seedTxns);
  const [budgets] = useState(seedBudgets);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState("All");

  const income    = useMemo(() => transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0), [transactions]);
  const expenses  = useMemo(() => transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0), [transactions]);
  const balance   = income - expenses;

  const categorySpend = useMemo(() => {
    const map = {};
    transactions.filter(t=>t.type==="expense").forEach(t => {
      map[t.category] = (map[t.category]||0) + t.amount;
    });
    return map;
  }, [transactions]);

  const pieData = Object.entries(categorySpend).map(([name,value])=>({name,value}));

  const barData = MONTH_NAMES.slice(0,4).map((m,i) => ({
    month: m,
    Income: [15000,12000,18000,18000][i],
    Expenses: [9350,8200,10500,expenses][i]
  }));

  const predictions = useMemo(() => {
    return Object.entries(categorySpend).reduce((acc, [cat, spent]) => {
      acc[cat] = Math.round(spent * 1.15);
      return acc;
    }, {});
  }, [categorySpend]);

  const filteredTxns = useMemo(() => {
    return filterCat === "All" ? [...transactions].reverse()
      : [...transactions].filter(t=>t.category===filterCat).reverse();
  }, [transactions, filterCat]);

  const handleAdd = (tx) => setTransactions(prev => [...prev, tx]);
  const handleDelete = (id) => setTransactions(prev => prev.filter(t=>t.id!==id));

  const navItems = [
    { id:"dashboard", icon:LayoutDashboard, label:"Dashboard" },
    { id:"transactions", icon:List, label:"Transactions" },
    { id:"budgets", icon:Target, label:"Budgets" },
    { id:"predictions", icon:Sparkles, label:"Predictions" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F0F4F8", fontFamily:"'Segoe UI', system-ui, sans-serif", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <header style={{
        background:"#0A2540", color:"#fff", padding:"0 24px",
        display:"flex", alignItems:"center", justifyContent:"space-between", height:60,
        boxShadow:"0 2px 12px rgba(0,0,0,0.2)", position:"sticky", top:0, zIndex:100
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:"#00B4D8", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Wallet size={18} color="#fff" />
          </div>
          <span style={{ fontWeight:800, fontSize:20, letterSpacing:"-0.3px" }}>BudgetWise</span>
          <span style={{ fontSize:11, background:"#00B4D8", borderRadius:6, padding:"2px 7px", marginLeft:4, fontWeight:600 }}>
            BETA
          </span>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display:"flex", alignItems:"center", gap:7, background:"#00B4D8",
          color:"#fff", border:"none", borderRadius:10, padding:"8px 16px",
          fontSize:14, fontWeight:600, cursor:"pointer"
        }}>
          <Plus size={16} /> Add
        </button>
      </header>

      {/* Nav */}
      <nav style={{
        background:"#fff", borderBottom:"1px solid #E2E8F0",
        display:"flex", overflowX:"auto", padding:"0 16px"
      }}>
        {navItems.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display:"flex", alignItems:"center", gap:7, padding:"14px 18px",
            border:"none", background:"transparent", cursor:"pointer", whiteSpace:"nowrap",
            fontSize:14, fontWeight: tab===id ? 700 : 500,
            color: tab===id ? "#0077B6" : "#64748B",
            borderBottom: tab===id ? "2px solid #0077B6" : "2px solid transparent",
            transition:"all 0.2s"
          }}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ flex:1, padding:"24px 20px", maxWidth:1000, margin:"0 auto", width:"100%", boxSizing:"border-box" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* KPIs */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16 }}>
              <KPICard label="Total Balance"   value={fmt(balance)}   icon={Wallet}        color="#0077B6" sub="All-time net" />
              <KPICard label="Total Income"    value={fmt(income)}    icon={TrendingUp}     color="#10B981" sub="All transactions" />
              <KPICard label="Total Expenses"  value={fmt(expenses)}  icon={TrendingDown}   color="#EF4444" sub="All transactions" />
              <KPICard label="This Month"      value={fmt(expenses)}  icon={IndianRupee}    color="#F59E0B" sub="April 2026" />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
              {/* Pie Chart */}
              <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700, color:"#0A2540" }}>Spending by Category</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={CAT_COLORS[entry.name] || "#94A3B8"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px 14px", justifyContent:"center" }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12 }}>
                      <div style={{ width:8, height:8, borderRadius:99, background:CAT_COLORS[d.name]||"#94A3B8" }} />
                      <span style={{ color:"#64748B" }}>{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
              <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700, color:"#0A2540" }}>Income vs Expenses</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize:12, fill:"#64748B" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Legend wrapperStyle={{ fontSize:12 }} />
                    <Bar dataKey="Income"   fill="#10B981" radius={[6,6,0,0]} />
                    <Bar dataKey="Expenses" fill="#00B4D8" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transactions */}
            <div style={{ background:"#fff", borderRadius:16, padding:24, boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin:"0 0 16px", fontSize:16, fontWeight:700, color:"#0A2540" }}>Recent Transactions</h3>
              {[...transactions].reverse().slice(0,5).map(tx => (
                <div key={tx.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #F1F5F9" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{
                      width:38, height:38, borderRadius:10,
                      background:(CAT_COLORS[tx.category]||"#64748B")+"18",
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:16
                    }}>
                      {tx.type==="income"?"💰":"💸"}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#1E293B" }}>{tx.description}</div>
                      <div style={{ fontSize:12, color:"#94A3B8" }}>{tx.category} · {tx.date}</div>
                    </div>
                  </div>
                  <span style={{ fontWeight:700, fontSize:15, color: tx.type==="income"?"#10B981":"#EF4444" }}>
                    {tx.type==="income"?"+":"-"}{fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab === "transactions" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Filter */}
            <div style={{ background:"#fff", borderRadius:16, padding:"16px 20px", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["All", ...CATEGORIES].map(c => (
                  <button key={c} onClick={() => setFilterCat(c)} style={{
                    padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer",
                    fontSize:13, fontWeight:600, transition:"all 0.2s",
                    background: filterCat===c ? "#0077B6" : "#F1F5F9",
                    color: filterCat===c ? "#fff" : "#64748B"
                  }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 16px rgba(0,0,0,0.07)", overflow:"hidden" }}>
              {filteredTxns.length === 0 && (
                <div style={{ padding:40, textAlign:"center", color:"#94A3B8" }}>No transactions found.</div>
              )}
              {filteredTxns.map((tx, idx) => (
                <div key={tx.id} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"14px 20px",
                  borderBottom: idx < filteredTxns.length-1 ? "1px solid #F8FAFC" : "none",
                  transition:"background 0.15s"
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{
                      width:42, height:42, borderRadius:12,
                      background:(CAT_COLORS[tx.category]||"#64748B")+"22",
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}>
                      {tx.type==="income"
                        ? <ArrowUpCircle size={20} color="#10B981" />
                        : <ArrowDownCircle size={20} color={CAT_COLORS[tx.category]||"#64748B"} />}
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#1E293B" }}>{tx.description || "No description"}</div>
                      <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>
                        <span style={{
                          background:(CAT_COLORS[tx.category]||"#64748B")+"18",
                          color: CAT_COLORS[tx.category]||"#64748B",
                          padding:"2px 8px", borderRadius:6, fontWeight:600, fontSize:11
                        }}>{tx.category}</span>
                        <span style={{ marginLeft:8 }}>{tx.date}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontWeight:700, fontSize:16, color: tx.type==="income"?"#10B981":"#EF4444" }}>
                      {tx.type==="income"?"+":"-"}{fmt(tx.amount)}
                    </span>
                    <button onClick={() => handleDelete(tx.id)} style={{
                      background:"#FEF2F2", border:"none", borderRadius:8,
                      padding:"6px 8px", cursor:"pointer"
                    }}>
                      <Trash2 size={14} color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BUDGETS ── */}
        {tab === "budgets" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 }}>
              {CATEGORIES.map(cat => (
                <div key={cat} style={{
                  background:"#fff", borderRadius:16, padding:"20px 22px",
                  boxShadow:"0 2px 16px rgba(0,0,0,0.07)",
                  borderTop:`3px solid ${CAT_COLORS[cat]||"#00B4D8"}`
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{
                      width:34, height:34, borderRadius:10,
                      background:(CAT_COLORS[cat]||"#00B4D8")+"22",
                      display:"flex", alignItems:"center", justifyContent:"center"
                    }}>
                      <Target size={16} color={CAT_COLORS[cat]||"#00B4D8"} />
                    </div>
                    <span style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{cat}</span>
                  </div>
                  <BudgetBar
                    category={cat}
                    limit={budgets[cat] || 1000}
                    spent={categorySpend[cat] || 0}
                  />
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background:"#0A2540", borderRadius:16, padding:"20px 24px", color:"#fff" }}>
              <h3 style={{ margin:"0 0 12px", fontSize:16 }}>📊 Budget Summary — April 2026</h3>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {[
                  { label:"Total Budget", value: fmt(Object.values(budgets).reduce((a,b)=>a+b,0)), color:"#00B4D8" },
                  { label:"Total Spent",  value: fmt(expenses), color:"#EF4444" },
                  { label:"Remaining",    value: fmt(Object.values(budgets).reduce((a,b)=>a+b,0) - expenses), color:"#10B981" },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ fontSize:12, color:"#8FB3CC", marginBottom:4 }}>{label}</div>
                    <div style={{ fontSize:20, fontWeight:700, color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PREDICTIONS ── */}
        {tab === "predictions" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{
              background:"linear-gradient(135deg,#0A2540,#0077B6)", borderRadius:16,
              padding:"24px 28px", color:"#fff"
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                <Sparkles size={22} color="#00B4D8" />
                <h2 style={{ margin:0, fontSize:20, fontWeight:700 }}>Smart Spending Predictions</h2>
              </div>
              <p style={{ margin:0, color:"#8FB3CC", fontSize:14 }}>
                Based on your past spending, here's your estimated end-of-month forecast for April 2026.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16 }}>
              {Object.entries(predictions).map(([cat, predicted]) => {
                const limit = budgets[cat] || 0;
                const isOver = predicted > limit;
                return (
                  <div key={cat} style={{
                    background:"#fff", borderRadius:16, padding:"20px 22px",
                    boxShadow:"0 2px 16px rgba(0,0,0,0.07)",
                    border: isOver ? "1px solid #FCA5A5" : "1px solid #E2E8F0"
                  }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <span style={{ fontWeight:700, fontSize:15, color:"#0A2540" }}>{cat}</span>
                      {isOver
                        ? <span style={{ background:"#FEF2F2", color:"#EF4444", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>⚠ Over Budget</span>
                        : <span style={{ background:"#F0FDF4", color:"#10B981", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>✓ On Track</span>}
                    </div>
                    <div style={{ fontSize:24, fontWeight:800, color: isOver?"#EF4444":"#0077B6", marginBottom:4 }}>
                      {fmt(predicted)}
                    </div>
                    <div style={{ fontSize:12, color:"#94A3B8" }}>
                      Predicted spend · Budget: {fmt(limit)}
                    </div>
                    <div style={{ marginTop:12, height:6, background:"#F1F5F9", borderRadius:99, overflow:"hidden" }}>
                      <div style={{
                        height:"100%", borderRadius:99, transition:"width 0.5s",
                        width:`${Math.min((predicted/limit)*100,100)}%`,
                        background: isOver ? "#EF4444" : CAT_COLORS[cat] || "#00B4D8"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background:"#F0F9FF", borderRadius:16, padding:"16px 20px", border:"1px solid #BAE6FD" }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <Sparkles size={18} color="#0077B6" style={{ marginTop:2 }} />
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0A2540", marginBottom:4 }}>How predictions work</div>
                  <div style={{ fontSize:13, color:"#0077B6", lineHeight:1.6 }}>
                    BudgetWise analyzes your spending from the past 3 months and applies a daily rate model to predict
                    your end-of-month totals per category. Categories marked ⚠ are projected to exceed your set budget.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
}

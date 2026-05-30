"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowUpDown, ChevronRight } from "lucide-react";

// --- ТЭНХИМИЙН 35 БАГШИЙН СТАТИК MOCK DATA (Латин B ашигласан) ---
export const TEACHERS_LIST = Array.from({ length: 35 }, (_, i) => {
  const id = `B${i + 1}`; // Кирил Б-г ЛАТИН B болгов (404 алдаанаас сэргийлнэ)
  const severityIndex = parseFloat(((i % 7) * 1.2 - 3.5).toFixed(1)); 
  const noise = parseFloat(((i % 5) * 0.9 + 1.2).toFixed(1));         
  
  const names = ["Бат-Эрдэнэ", "Болд", "Сүхбат", "Лхагва", "Эрдэнэ", "Ганзориг", "Саруул", "Төгөлдөр", "Ану", "Хүслэн"];
  const degrees = ["Проф.", "Доц.", "Ахлах багш", "Багш"];
  
  return {
    id,
    name: `${degrees[i % 4]} Д. ${names[i % names.length]}`,
    severityIndex,
    noise,
    commissionId: `Комисс ${Math.floor(i / 4) + 1}`,
  };
});

const getSeverityStatus = (index: number) => {
  if (index < -2) return { label: "Маш хатуу", color: "bg-red-50 text-red-700 border-red-200" };
  if (index >= -2 && index < -1) return { label: "Хатуу", color: "bg-orange-50 text-orange-700 border-orange-200" };
  if (index >= -1 && index <= 1) return { label: "Хэвийн", color: "bg-green-50 text-green-700 border-green-200" };
  if (index > 1 && index <= 2) return { label: "Зөөлөн", color: "bg-blue-50 text-blue-700 border-blue-200" };
  return { label: "Маш зөөлөн", color: "bg-purple-50 text-purple-700 border-purple-200" };
};

export default function TeachersListPage() {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const processedTeachers = useMemo(() => {
    return TEACHERS_LIST.filter(t => 
      t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      return sortOrder === "asc" ? a.severityIndex - b.severityIndex : b.severityIndex - a.severityIndex;
    });
  }, [search, sortOrder]);

  if (!mounted) {
    return <div className="p-6 text-center text-slate-400 font-medium">Системийг ачаалж байна...</div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Багш нарын Нэгдсэн Жагсаалт</h1>
          <p className="text-sm text-slate-500 mt-1">МКУТ-ийн идэвхтэй 35 багшийн үнэлгээний зан төлөвийн анализ</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Багшийн нэр, ID-аар хайх (Өнгөөр ялгасан)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm shadow-sm"
            />
          </div>
          
          <button 
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            Индексээр: {sortOrder === "desc" ? "Хатуугаас зөөлөн" : "Зөөлнөөс хатуу"}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">ID / Багшийн нэр</th>
                  <th className="py-4 px-6">Харьяалагдах Комисс</th>
                  <th className="py-4 px-6">Severity Index</th>
                  <th className="py-4 px-6">Noise (σ)</th>
                  <th className="py-4 px-6">Ангилал</th>
                  <th className="py-4 px-6 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {processedTeachers.map((teacher) => {
                  const status = getSeverityStatus(teacher.severityIndex);
                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs font-bold">{teacher.id}</span>
                          <span>{teacher.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-medium">{teacher.commissionId}</td>
                      <td className={`py-4 px-6 font-mono font-bold ${teacher.severityIndex < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {teacher.severityIndex > 0 ? `+${teacher.severityIndex}` : teacher.severityIndex}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-600">{teacher.noise}</td>
                      <td className="py-4 px-6">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/teachers/${teacher.id}`}>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-pointer">
                            Анализ үзэх
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
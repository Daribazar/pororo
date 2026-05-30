"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar 
} from "recharts";
import { ArrowLeft, BookOpen, GraduationCap, ShieldCheck, Flame, Layers } from "lucide-react";
import { TEACHERS_LIST } from "../page"; // Жагсаалтын датаг эндээс уншина

export default function TeacherDashboardDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [season, setSeason] = useState<"winter" | "spring">("spring");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Сонгогдсон багшийн бодит датаг жагсаалтаас шүүж авах архитектур
  const teacherInfo = useMemo(() => {
    const found = TEACHERS_LIST.find(t => t.id === id);
    if (found) return found;
    // Хэрэв олдохгүй бол default утга буцаана (Алдаанаас хамгаална)
    return { id: id || "B1", name: "Д. Профессор (Томилогдсон)", severityIndex: -1.2, noise: 2.4 };
  }, [id]);

  // Улирлын хамааралтай мок датаг динамикаар үүсгэх логик
  const activeSeasonData = useMemo(() => {
    const factor = season === "winter" ? 0.85 : 1.05; // Өвлийн улиралд дүн арай хатуу байх бодит симуляци
    return [
      { name: "Удирдагч", max: 15, score: parseFloat((13 * factor).toFixed(1)) },
      { name: "Үзлэг", max: 20, score: parseFloat((16 * factor).toFixed(1)) },
      { name: "Урьдчилсан", max: 25, score: parseFloat((20 * factor).toFixed(1)) },
      { name: "Жинхэнэ хамгаалалт", max: 35, score: parseFloat((28 * factor).toFixed(1)) },
      { name: "Шүүмжлэгч", max: 5, score: parseFloat((4.2 * factor).toFixed(1)) }
    ];
  }, [season]);

  const staticDetails = {
    classes: ["Програмчлалын үндэс", "Өгөгдлийн сангийн систем", "Системийн анализ ба дизайн"],
    papers: ["Machine Learning Models for Fair Grading in Higher Education", "Distributed Academic Ledger System Optimization"]
  };

  if (!mounted) {
    return <div className="p-6 text-center text-slate-400 font-medium">Дашбоард ачаалж байна...</div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link href="/teachers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Багш нарын жагсаалт руу буцах
          </Link>
          
          <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setSeason("winter")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${season === "winter" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              ❄️ Өвөл сонгох (30-50 оюутан)
            </button>
            <button 
              onClick={() => setSeason("spring")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${season === "spring" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              🌱 Хавар сонгох (150-200 оюутан)
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
              <GraduationCap className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <span className="text-xs font-mono bg-indigo-500/30 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md font-bold">{teacherInfo.id}</span>
              <h2 className="text-2xl font-black tracking-tight mt-1">{teacherInfo.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5">МУИС - Мэдээллийн Технологи, Электрониксийн Сургууль</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Severity Index</p>
              <p className="text-xl font-mono font-black text-rose-400">{teacherInfo.severityIndex}</p>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Noise (σ)</p>
              <p className="text-xl font-mono font-black text-yellow-400">{teacherInfo.noise}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">5 Шатлалт Процессын Дундаж Үнэлгээ</h3>
                <p className="text-xs text-slate-400">Улирлаар шүүгдсэн дүнгийн бодолтын бүтэц</p>
              </div>
              <Layers className="text-indigo-500 w-5 h-5" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeSeasonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Өгсөн оноо" />
                  <Bar dataKey="max" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Максимум" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Үнэлгээний Радар хэлбэр</h3>
                <p className="text-xs text-slate-400">Тэнцвэрийн харьцаа</p>
              </div>
              <Flame className="text-rose-500 w-5 h-5" />
            </div>
            <div className="h-64 flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" radius="70%" data={activeSeasonData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <Radar name="Оноо" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-4 text-sm">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Заадаг Хичээлүүд
            </div>
            <div className="space-y-2">
              {staticDetails.classes.map((cls, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                  {cls}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-4 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Сүүлийн үеийн Судалгааны бүтээлүүд
            </div>
            <div className="space-y-2">
              {staticDetails.papers.map((paper, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 italic">
                  "{paper}"
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
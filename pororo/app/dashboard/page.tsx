"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Summary = {
  totalStudents: number;
  totalTeachers: number;
  totalCommittees: number;
  averageFinalScore: number;
  minFinalScore: number;
  maxFinalScore: number;
  passRate: number;
};

type Teacher = {
  id: string;
  name: string;
  severity_index: number;
  bias: number;
  noise: number;
  avg_all: number;
  graders_count: number;
  fingerprint: string;
  severity_category: string;
};

type TeacherAnalytics = {
  strictest: Teacher[];
  mostLenient: Teacher[];
  teachers: Teacher[];
};

function severityColor(idx: number) {
  if (idx <= -5) return { text: "text-red-500", bg: "bg-red-50", border: "border-red-200", hex: "#ef4444" };
  if (idx < -2)  return { text: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200", hex: "#f97316" };
  if (idx > 5)   return { text: "text-violet-500", bg: "bg-violet-50", border: "border-violet-200", hex: "#8b5cf6" };
  if (idx > 2)   return { text: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", hex: "#3b82f6" };
  return { text: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", hex: "#10b981" };
}

function severityLabel(idx: number) {
  if (idx <= -5) return "Маш хатуу";
  if (idx < -2)  return "Хатуу";
  if (idx > 5)   return "Маш зөөлөн";
  if (idx > 2)   return "Зөөлөн";
  return "Хэвийн";
}

function Bar({ value, max = 100, hex }: { value: number; max?: number; hex: string }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100">
      <div
        className="h-1.5 rounded-full transition-all duration-700"
        style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: hex }}
      />
    </div>
  );
}

function StatCard({ label, value, sub, hex }: { label: string; value: string | number; sub?: string; hex: string }) {
  return (
    <div className="relative border border-gray-100 rounded-xl p-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: hex }} />
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-300 mt-1.5">{sub}</p>}
    </div>
  );
}

function TeacherRow({ t, rank }: { t: Teacher; rank: number }) {
  const idx = parseFloat(String(t.severity_index ?? 0));
  const clr = severityColor(idx);
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      <span className="text-xs text-gray-300 font-mono w-4 shrink-0">{rank}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
        <p className="text-xs text-gray-300 truncate">{t.fingerprint}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${clr.bg} ${clr.text} ${clr.border}`}>
          {severityLabel(idx)}
        </span>
        <span className={`text-sm font-semibold w-10 text-right ${clr.text}`}>
          {idx > 0 ? "+" : ""}{idx.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5001/api/summary").then((r) => r.json()),
      fetch("http://localhost:5001/api/teachers/analytics").then((r) => r.json()),
    ])
      .then(([s, a]) => { setSummary(s); setAnalytics(a); })
      .catch(() => setError("Backend холбогдсонгүй. localhost:5001 ажиллаж байгаа эсэхийг шалгана уу."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-300 animate-pulse">Ачаалж байна...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-sm text-red-400 text-center max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">Хяналтын самбар</h1>
            <p className="text-xs text-gray-400">Дипломын хамгаалалтын нэгдсэн статистик</p>
          </div>
          <nav className="flex gap-1">
            {[
              { href: "/", label: "Нүүр" },
              { href: "/teachers", label: "Багш нар" },
              { href: "/students", label: "Оюутан" },
              { href: "/compare", label: "Зөрүү шинжилгээ" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">

        {/* Stat cards */}
        {summary && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Нийт оюутан"  value={summary.totalStudents}    sub="бүртгэлтэй"     hex="#3b82f6" />
              <StatCard label="Нийт багш"    value={summary.totalTeachers}    sub="үнэлгээ өгсөн"  hex="#8b5cf6" />
              <StatCard label="Комисс"       value={summary.totalCommittees}  sub="хороо"          hex="#f97316" />
              <StatCard label="Тэнцсэн"      value={`${summary.passRate}%`}   sub="нийт оюутнаас" hex="#10b981" />
            </div>

            {/* Score breakdown */}
            <div className="border border-gray-100 rounded-xl p-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Онооны дүн шинжилгээ</h2>
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="shrink-0 text-center border border-blue-100 bg-blue-50 rounded-xl px-8 py-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Дундаж оноо</p>
                  <p className="text-5xl font-bold text-blue-500 leading-none">{summary.averageFinalScore}</p>
                  <p className="text-xs text-gray-400 mt-1">/ 100</p>
                </div>
                <div className="flex-1 w-full flex flex-col gap-5">
                  {[
                    { label: "Дундаж оноо",        value: summary.averageFinalScore, hex: "#3b82f6" },
                    { label: "Хамгийн өндөр оноо", value: summary.maxFinalScore,     hex: "#10b981" },
                    { label: "Хамгийн бага оноо",  value: summary.minFinalScore,     hex: "#ef4444" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="font-semibold" style={{ color: item.hex }}>{item.value}</span>
                      </div>
                      <Bar value={item.value} hex={item.hex} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Strictest / most lenient */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { title: "Хамгийн хатуу багш нар", hint: "Severity index — бага байх тусам хатуу", dot: "#ef4444", list: analytics.strictest },
              { title: "Хамгийн зөөлөн багш нар", hint: "Severity index — өндөр байх тусам зөөлөн", dot: "#8b5cf6", list: analytics.mostLenient },
            ].map((section) => (
              <div key={section.title} className="border border-gray-100 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: section.dot }} />
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</h2>
                </div>
                <p className="text-xs text-gray-300 mb-5 pl-4">{section.hint}</p>
                <div className="flex flex-col gap-2">
                  {section.list.map((t, i) => <TeacherRow key={t.id} t={t} rank={i + 1} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* All teachers table */}
        {analytics && (
          <div className="border border-gray-100 rounded-xl p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">Бүх багшийн дундаж оноо</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Нэр", "Дундаж оноо", "Severity", "Noise", "Үнэлсэн", "Ангилал"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-semibold text-gray-300 uppercase tracking-wide px-3 py-2 first:pl-0 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.teachers.map((t) => {
                    const avg = parseFloat(String(t.avg_all ?? 0));
                    const idx = parseFloat(String(t.severity_index ?? 0));
                    const noise = parseFloat(String(t.noise ?? 0));
                    const clr = severityColor(idx);
                    return (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 first:pl-0 font-medium text-gray-800 whitespace-nowrap">{t.name}</td>
                        <td className="px-3 py-2.5 min-w-[130px]">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs font-semibold ${clr.text}`}>{avg.toFixed(1)}</span>
                            <Bar value={avg} max={40} hex={clr.hex} />
                          </div>
                        </td>
                        <td className={`px-3 py-2.5 font-semibold text-xs ${clr.text}`}>{idx > 0 ? "+" : ""}{idx.toFixed(1)}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-400">{noise.toFixed(1)}</td>
                        <td className="px-3 py-2.5 text-xs text-gray-400">{t.graders_count}</td>
                        <td className="px-3 py-2.5 last:pr-0">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${clr.bg} ${clr.text} ${clr.border}`}>
                            {t.severity_category}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

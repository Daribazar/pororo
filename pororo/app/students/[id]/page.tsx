"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type StudentDetail = {
  student: {
    student_id: string;
    name: string;
    program: string;
    Сэдэв: string;
    advisor: string;
    committee: string;
    final_score_100: string;
    pass: string;
  };
  scoreBreakdown: {
    yavts1_15: string;
    yavts2_avg_20: string;
    uri_avg_25: string;
    reviewer_5: string;
    defense_avg_35: string;
    final_score_100: string;
  };
  alerts: { type: string; message: string }[];
};

type LLMScore = {
  score: number;
  innovation: number;
  execution: number;
  report: number;
  feedback: string;
  created_at: string;
};

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-700 font-medium">{value}<span className="text-gray-300 font-normal">/{max}</span></span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full bg-gray-900 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StudentDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [llm, setLlm] = useState<LLMScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5001/api/students/${id}`).then((r) => r.json()),
      fetch(`http://localhost:5001/api/thesis/scores/${id}`).then((r) => r.json()),
    ]).then(([studentData, llmData]) => {
      setData(studentData);
      setLlm(llmData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-300 animate-pulse">Ачаалж байна...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Оюутан олдсонгүй</p>
      </main>
    );
  }

  const { student, scoreBreakdown, alerts } = data;
  const passed = student.pass === "Тэнцсэн";

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <button onClick={() => router.back()} className="mb-8 text-xs text-gray-300 hover:text-gray-500 transition-colors">
          ← Буцах
        </button>

        {/* Student header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="text-xs text-gray-400 font-mono">{student.student_id}</span>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">{student.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{student.program}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-gray-900">{parseFloat(student.final_score_100).toFixed(1)}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              {student.pass}
            </span>
          </div>
        </div>

        {/* Topic */}
        <div className="border border-gray-100 rounded-xl px-5 py-4 mb-6">
          <p className="text-xs text-gray-400 mb-1">Дипломын сэдэв</p>
          <p className="text-sm text-gray-700">{student.Сэдэв}</p>
          <div className="flex gap-6 mt-3">
            <span className="text-xs text-gray-400">Зөвлөх: <span className="text-gray-600">{student.advisor}</span></span>
            <span className="text-xs text-gray-400">Комисс: <span className="text-gray-600">{student.committee}</span></span>
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="flex flex-col gap-2 mb-6">
            {alerts.map((a, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 text-xs ${a.type === "warning" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                {a.message}
              </div>
            ))}
          </div>
        )}

        {/* Score breakdown */}
        <div className="border border-gray-100 rounded-xl px-5 py-5 mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-5">Үнэлгээний задаргаа</h2>
          <div className="flex flex-col gap-4">
            <Bar label="Явцын 1 үнэлгээ" value={parseFloat(scoreBreakdown.yavts1_15)} max={15} />
            <Bar label="Явцын 2 дундаж" value={parseFloat(scoreBreakdown.yavts2_avg_20)} max={20} />
            <Bar label="URI дундаж" value={parseFloat(scoreBreakdown.uri_avg_25)} max={25} />
            <Bar label="Рецензент" value={parseFloat(scoreBreakdown.reviewer_5)} max={5} />
            <Bar label="Хамгаалалт дундаж" value={parseFloat(scoreBreakdown.defense_avg_35)} max={35} />
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">Нийт оноо</span>
            <span className="text-xl font-semibold text-gray-900">{parseFloat(scoreBreakdown.final_score_100).toFixed(1)}<span className="text-sm font-normal text-gray-300">/100</span></span>
          </div>
        </div>

        {/* LLM score */}
        {llm ? (
          <div className="border border-gray-100 rounded-xl px-5 py-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-medium text-gray-900">AI үнэлгээ</h2>
              <span className="text-xl font-semibold text-gray-900">{llm.score}<span className="text-sm font-normal text-gray-300">/100</span></span>
            </div>
            <div className="flex flex-col gap-4 mb-5">
              <Bar label="Шинэлэг тал, практик ач холбогдол" value={llm.innovation} max={35} />
              <Bar label="Онолийн мэдлэг, ажлын гүйцэтгэл" value={llm.execution} max={40} />
              <Bar label="Тайлан боловсруулалт" value={llm.report} max={25} />
            </div>
            <p className="text-xs text-gray-500 border-t border-gray-100 pt-4 leading-relaxed">{llm.feedback}</p>
            <p className="text-[10px] text-gray-300 mt-2">{new Date(llm.created_at).toLocaleString("mn-MN")}</p>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-xl px-5 py-8 text-center">
            <p className="text-sm text-gray-400">AI үнэлгээ байхгүй байна</p>
            <p className="text-xs text-gray-300 mt-1">PDF upload хийхдээ оюутны ID-г оруулна уу</p>
          </div>
        )}

      </div>
    </main>
  );
}

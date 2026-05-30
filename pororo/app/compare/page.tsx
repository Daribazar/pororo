"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  student_id: string;
  name: string;
  Сэдэв: string;
  final_score_100: string;
  uri_avg_25: string;
  defense_avg_35: string;
};

type LLMScore = {
  student_id: string;
  score: number;
  innovation: number;
  execution: number;
  report: number;
  feedback: string;
};

type Row = {
  student: Student;
  teacherScore: number;  // uri(25) + defense(35) = 60-аас 100 масштабт
  llmScore: number;      // AI оноо 80-99
  diff: number;          // llmScore - teacherScore (100 масштабт)
};

function DualBar({ teacherScore, llmScore }: { teacherScore: number; llmScore: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-12 shrink-0">Багш</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
          <div className="h-1.5 bg-gray-700 rounded-full" style={{ width: `${teacherScore}%` }} />
        </div>
        <span className="text-xs font-medium text-gray-700 w-8 text-right">{teacherScore.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400 w-12 shrink-0">AI</span>
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
          <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: `${llmScore}%` }} />
        </div>
        <span className="text-xs font-medium text-blue-500 w-8 text-right">{llmScore}</span>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"diff" | "teacher" | "llm">("diff");

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5001/api/students").then((r) => r.json()),
      fetch("http://localhost:5001/api/thesis/scores").then((r) => r.json()),
    ]).then(([students, llmScores]: [Student[], LLMScore[]]) => {
      const llmMap = new Map<string, LLMScore>();
      llmScores.forEach((s) => {
        if (s.student_id && !llmMap.has(s.student_id)) {
          llmMap.set(s.student_id, s);
        }
      });

      const matched: Row[] = [];
      students.forEach((student) => {
        const llm = llmMap.get(student.student_id);
        if (!llm) return;

        // URI(25) + Defense(35) = 60 оноо → 100 масштабт шилжүүлнэ
        const uri = parseFloat(student.uri_avg_25) || 0;
        const defense = parseFloat(student.defense_avg_35) || 0;
        const teacherScore = Math.round(((uri + defense) / 60) * 100);
        const llmScore = llm.score;

        matched.push({
          student,
          teacherScore,
          llmScore,
          diff: llmScore - teacherScore,
        });
      });

      setRows(matched);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sorted = [...rows].sort((a, b) => {
    if (sort === "diff") return Math.abs(b.diff) - Math.abs(a.diff);
    if (sort === "teacher") return b.teacherScore - a.teacherScore;
    return b.llmScore - a.llmScore;
  });

  const avgDiff = rows.length ? rows.reduce((s, r) => s + r.diff, 0) / rows.length : 0;
  const maxOver = rows.length ? Math.max(...rows.map((r) => r.diff)) : 0;
  const maxUnder = rows.length ? Math.min(...rows.map((r) => r.diff)) : 0;

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <button onClick={() => router.back()} className="mb-8 text-xs text-gray-300 hover:text-gray-500 transition-colors">
          ← Буцах
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Үнэлгээний зөрүү</h1>
        <p className="text-sm text-gray-400 mb-6">Багшийн оноо болон AI үнэлгээний харьцуулалт</p>

        {/* Methodology explanation */}
        <div className="border border-gray-100 rounded-xl p-5 mb-10 flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Багшийн оноо</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              URI дундаж <span className="text-gray-600 font-medium">(25 оноо)</span> + Хамгаалалт дундаж <span className="text-gray-600 font-medium">(35 оноо)</span> = нийт 60 оноог 100 масштабт шилжүүлсэн.
              Зөвхөн дипломын бичгийн чанартай холбоотой хэсгийг авсан.
            </p>
          </div>
          <div className="w-px bg-gray-100 shrink-0 hidden sm:block" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">AI үнэлгээ</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Шинэлэг тал <span className="text-gray-600 font-medium">(35)</span> + Гүйцэтгэл <span className="text-gray-600 font-medium">(40)</span> + Тайлан <span className="text-gray-600 font-medium">(25)</span> — PDF-н текстэд тулгуурлан LLM-ийн өгсөн оноо.
              Зорилго→Судалгаа→Зохиомж→Хэрэгжүүлэлтийн уялдааг шалгасан.
            </p>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-300 animate-pulse text-center py-20">Ачаалж байна...</p>}

        {!loading && rows.length === 0 && (
          <div className="border border-gray-100 rounded-xl p-10 text-center">
            <p className="text-sm text-gray-400">Харьцуулах өгөгдөл байхгүй байна</p>
            <p className="text-xs text-gray-300 mt-1">Оюутны PDF upload хийж AI үнэлгээ авна уу</p>
          </div>
        )}

        {rows.length > 0 && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: "Дундаж зөрүү", value: `${avgDiff > 0 ? "+" : ""}${avgDiff.toFixed(1)}`, sub: "AI − Багш", color: avgDiff > 0 ? "text-blue-500" : "text-orange-500" },
                { label: "Хамгийн их давсан", value: `+${maxOver.toFixed(1)}`, sub: "AI > Багш", color: "text-blue-500" },
                { label: "Хамгийн их дутсан", value: maxUnder.toFixed(1), sub: "AI < Багш", color: "text-orange-500" },
              ].map((c) => (
                <div key={c.label} className="border border-gray-100 rounded-xl p-5">
                  <p className="text-xs text-gray-400 mb-2">{c.label}</p>
                  <p className={`text-2xl font-semibold ${c.color}`}>{c.value}</p>
                  <p className="text-[10px] text-gray-300 mt-1">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-2 mb-5">
              {([["diff", "Зөрүүгээр"], ["teacher", "Багшийн оноогоор"], ["llm", "AI оноогоор"]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${sort === key ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="flex flex-col gap-3">
              {sorted.map(({ student, teacherScore, llmScore, diff }) => {
                const isOver = diff > 0;
                const absDiff = Math.abs(diff);
                return (
                  <div key={student.student_id} onClick={() => router.push(`/compare/${student.student_id}`)} className="border border-gray-100 rounded-xl px-5 py-4 cursor-pointer hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-gray-400">{student.student_id}</span>
                          <p className="text-sm font-medium text-gray-800 truncate">{student.name}</p>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{student.Сэдэв}</p>
                      </div>
                      <div className="shrink-0 ml-4 text-right">
                        <span className={`text-sm font-semibold ${isOver ? "text-blue-500" : "text-orange-500"}`}>
                          {isOver ? "+" : ""}{diff.toFixed(1)}
                        </span>
                        <p className="text-[10px] text-gray-300">{isOver ? "AI давсан" : "AI дутсан"}</p>
                      </div>
                    </div>

                    <DualBar teacherScore={teacherScore} llmScore={llmScore} />

                    {absDiff >= 10 && (
                      <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mt-3">
                        ⚠ Зөрүү {absDiff.toFixed(1)} оноо — үнэлгээний ялгаа их байна
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

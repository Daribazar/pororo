"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

type DefenseScore = {
  teacher_id: string;
  teacher_name: string;
  teacher_role: string;
  innov_9: number;
  theory_10: number;
  qa_4: number;
  report_7: number;
  pres_5: number;
  total_35: number;
};

type StudentDetail = {
  student: {
    student_id: string;
    name: string;
    Сэдэв: string;
    uri_avg_25: number;
    defense_avg_35: number;
    final_score_100: number;
    defense_trimmed: number;
  };
  defenseScores: DefenseScore[];
  fairness: {
    controversyScore: number;
    trimmedDifference: number;
  };
};

type LLMScore = {
  score: number;
  innovation: number;
  execution: number;
  report: number;
  feedback: string;
};

type TeacherMeta = {
  id: string;
  name: string;
  severity_index: number;
  severity_category: string;
};

// ── Math helpers ──────────────────────────────────────────────────────────────

function mean(arr: number[]) {
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

function stddev(arr: number[]) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, n) => s + (n - m) ** 2, 0) / arr.length);
}

// AI-н 80-99 оноог 35-н масштабт шилжүүлэх
function aiTo35(score: number) {
  return Math.round(((score - 80) / 19) * 35 * 10) / 10;
}

// Severity index-ийг ашиглан багшийн оноог засварлах
function biasCorrect(total: number, severityIndex: number) {
  // severity_index нь багшийн дундажаас хазайлт. Засварлахад хасна.
  return Math.max(0, Math.min(35, Math.round((total - severityIndex / 3) * 10) / 10));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">{children}</h2>;
}

function Formula({ label, expr, result, color = "text-gray-900" }: { label: string; expr: string; result: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-400 font-mono">{expr}</span>
        <span className={`text-sm font-semibold ${color}`}>{result}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompareDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [llm, setLlm] = useState<LLMScore | null>(null);
  const [teachers, setTeachers] = useState<TeacherMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5001/api/students/${id}`).then((r) => r.json()),
      fetch(`http://localhost:5001/api/thesis/scores/${id}`).then((r) => r.json()),
      fetch(`http://localhost:5001/api/teachers/analytics`).then((r) => r.json()),
    ]).then(([studentData, llmData, analyticsData]) => {
      setData(studentData);
      setLlm(llmData);
      setTeachers(analyticsData.teachers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-sm text-gray-300 animate-pulse">Шинжилж байна...</p>
    </main>
  );

  if (!data) return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-sm text-gray-400">Өгөгдөл олдсонгүй</p>
    </main>
  );

  const { student, defenseScores, fairness } = data;

  // ── Тооцоолол ──────────────────────────────────────────────────────────────

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const rawTotals = defenseScores.map((d) => Number(d.total_35));
  const rawMean = rawTotals.length ? mean(rawTotals) : 0;
  const rawStd = rawTotals.length > 1 ? stddev(rawTotals) : 0;

  const corrected = defenseScores.map((d) => {
    const meta = teacherMap.get(d.teacher_id);
    const si = meta ? Number(meta.severity_index) : 0;
    return biasCorrect(Number(d.total_35), si);
  });
  const correctedMean = corrected.length ? mean(corrected) : 0;

  const uriScore = Number(student.uri_avg_25);
  const defenseRaw = Number(student.defense_avg_35);
  const teacherFinal = Math.round(((uriScore + defenseRaw) / 60) * 100);
  const teacherCorrected = Math.round(((uriScore + correctedMean) / 60) * 100);

  const aiCalibrated = llm ? aiTo35(llm.score) : null;
  const aiScaled = llm ? Math.round(((uriScore + (aiCalibrated ?? 0)) / 60) * 100) : null;

  // ── Chart data ─────────────────────────────────────────────────────────────

  const teacherBarData = defenseScores.map((d, i) => {
    const meta = teacherMap.get(d.teacher_id);
    const si = meta ? Number(meta.severity_index) : 0;
    return {
      name: d.teacher_name.split(".")[1] || d.teacher_name,
      role: d.teacher_role,
      raw: Number(d.total_35),
      corrected: biasCorrect(Number(d.total_35), si),
      severity: si.toFixed(1),
    };
  });

  const breakdownRadar = llm ? [
    { subject: "Шинэлэг байдал", teacher: Math.round((Number(defenseScores[0]?.innov_9 || 0) / 9) * 35), ai: llm.innovation, fullMark: 35 },
    { subject: "Онолийн мэдлэг", teacher: Math.round((Number(defenseScores[0]?.theory_10 || 0) / 10) * 40), ai: llm.execution, fullMark: 40 },
    { subject: "Тайлан/Илтгэл", teacher: Math.round(((Number(defenseScores[0]?.report_7 || 0) + Number(defenseScores[0]?.pres_5 || 0)) / 12) * 25), ai: llm.report, fullMark: 25 },
  ] : [];

  const scoreCompare = [
    { name: "Багш (raw)", score: teacherFinal, fill: "#6b7280" },
    { name: "Багш (засварласан)", score: teacherCorrected, fill: "#374151" },
    ...(aiScaled ? [{ name: "AI тооцоолол", score: aiScaled, fill: "#3b82f6" }] : []),
    ...(llm ? [{ name: "AI шууд", score: llm.score, fill: "#93c5fd" }] : []),
  ];

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button onClick={() => router.back()} className="mb-8 text-xs text-gray-300 hover:text-gray-500 transition-colors">
          ← Буцах
        </button>

        {/* Header */}
        <div className="mb-10">
          <span className="text-xs font-mono text-gray-400">{student.student_id}</span>
          <h1 className="text-2xl font-semibold text-gray-900 mt-1">{student.name}</h1>
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{student.Сэдэв}</p>
        </div>

        {/* ── 1. Оноонуудын харьцуулалт ── */}
        <div className="border border-gray-100 rounded-xl p-6 mb-6">
          <SectionTitle>Оноонуудын харьцуулалт (100 масштаб)</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreCompare} barSize={36} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} width={120} />
              <Tooltip
                formatter={(v: number) => [`${v} оноо`, ""]}
                contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}
              />
              <Bar dataKey="score" radius={4}>
                {scoreCompare.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {scoreCompare.map((s) => (
              <div key={s.name} className="text-center">
                <p className="text-xs text-gray-400 mb-1">{s.name}</p>
                <p className="text-xl font-semibold" style={{ color: s.fill }}>{s.score}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Яагаад багш иим оноо өгсөн бэ ── */}
        <div className="border border-gray-100 rounded-xl p-6 mb-6">
          <SectionTitle>Яагаад багш иим оноо өгсөн бэ?</SectionTitle>

          {/* Individual teacher scores */}
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={teacherBarData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis domain={[0, 35]} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const d = teacherBarData.find((t) => t.name === label);
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 text-xs shadow-sm">
                        <p className="font-medium text-gray-800 mb-1">{label} ({d?.role})</p>
                        <p className="text-gray-500">Өгсөн оноо: <span className="font-semibold text-gray-800">{payload[0]?.value}</span></p>
                        <p className="text-gray-500">Засварласан: <span className="font-semibold text-gray-800">{payload[1]?.value}</span></p>
                        <p className="text-gray-400">Severity: {d?.severity}</p>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="raw" name="Өгсөн оноо" fill="#d1d5db" radius={[4, 4, 0, 0]} />
                <Bar dataKey="corrected" name="Bias засварласан" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Math explanation */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-600 mb-3">Математик тооцоолол</p>
            <Formula label="Багш нарын дундаж (raw)" expr={`${rawTotals.join(" + ")} ÷ ${rawTotals.length}`} result={`${rawMean.toFixed(1)} / 35`} />
            <Formula label="Стандарт хазайлт (σ)" expr="stddev(scores)" result={`σ = ${rawStd.toFixed(2)}`} color={rawStd > 5 ? "text-amber-600" : "text-emerald-600"} />
            <Formula label="Bias засварласан дундаж" expr="mean - severity/3" result={`${correctedMean.toFixed(1)} / 35`} color="text-gray-900" />
            <Formula label="URI + Defense (raw) → 100" expr={`(${uriScore} + ${defenseRaw}) ÷ 60 × 100`} result={`${teacherFinal}`} />
            <Formula label="URI + Defense (засварласан) → 100" expr={`(${uriScore} + ${correctedMean.toFixed(1)}) ÷ 60 × 100`} result={`${teacherCorrected}`} color="text-gray-900" />
            {rawStd > 5 && (
              <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3">
                ⚠ σ = {rawStd.toFixed(2)} — багш нарын санал нэг биш, маргаантай үнэлгээ
              </p>
            )}
          </div>
        </div>

        {/* ── 3. Яагаад AI иим оноо өгсөн бэ ── */}
        {llm && (
          <div className="border border-gray-100 rounded-xl p-6 mb-6">
            <SectionTitle>Яагаад AI иим оноо өгсөн бэ?</SectionTitle>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: "Шинэлэг тал, практик", value: llm.innovation, max: 35, color: "#3b82f6" },
                { label: "Онолийн мэдлэг, гүйцэтгэл", value: llm.execution, max: 40, color: "#6366f1" },
                { label: "Тайлан боловсруулалт", value: llm.report, max: 25, color: "#8b5cf6" },
              ].map((item) => (
                <div key={item.label} className="text-center border border-gray-100 rounded-xl p-4">
                  <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">{item.label}</p>
                  <p className="text-2xl font-semibold" style={{ color: item.color }}>{item.value}</p>
                  <p className="text-[10px] text-gray-300">/{item.max}</p>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full">
                    <div className="h-1 rounded-full" style={{ width: `${(item.value / item.max) * 100}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* AI calibration math */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-medium text-gray-600 mb-3">AI оноог хамгаалалтын масштабт шилжүүлэх</p>
              <Formula label="AI шууд оноо" expr="range: 80–99" result={`${llm.score} / 100`} color="text-blue-500" />
              <Formula label="35 масштабт шилжүүлэх" expr={`(${llm.score} − 80) ÷ 19 × 35`} result={`${aiCalibrated} / 35`} color="text-blue-600" />
              <Formula label="URI + AI_defense → 100" expr={`(${uriScore} + ${aiCalibrated}) ÷ 60 × 100`} result={`${aiScaled}`} color="text-blue-700" />
            </div>

            <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{llm.feedback}</p>
          </div>
        )}

        {/* ── 4. Хэмжих хүрээний харьцуулалт ── */}
        {llm && breakdownRadar.length > 0 && (
          <div className="border border-gray-100 rounded-xl p-6">
            <SectionTitle>Шалгуур тус бүрийн харьцуулалт</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={breakdownRadar}>
                <PolarGrid stroke="#f3f4f6" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <Radar name="Багш (засварласан)" dataKey="teacher" stroke="#374151" fill="#374151" fillOpacity={0.15} />
                <Radar name="AI үнэлгээ" dataKey="ai" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-gray-400 text-center mt-2">
              Радар диаграм: хоёр үнэлгээний хүрээ давхцах тусам тохирол өндөр
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

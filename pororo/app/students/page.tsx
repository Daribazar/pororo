"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Student = {
  student_id: string;
  name: string;
  program: string;
  Сэдэв: string;
  advisor: string;
  final_score_100: string;
  pass: string;
};

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5001/api/students")
      .then((r) => r.json())
      .then((data) => { setStudents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = students.filter((s) =>
    [s.name, s.student_id, s.Сэдэв].some((v) =>
      v?.toLowerCase().includes(query.toLowerCase())
    )
  );

  return (
    <main className="min-h-screen bg-white px-4 py-16">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Оюутны жагсаалт</h1>
          <p className="text-sm text-gray-400">Оюутан дээр дарж дэлгэрэнгүй мэдээлэл харах</p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Нэр, ID эсвэл сэдвээр хайх..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full mb-8 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-gray-400 transition-colors"
        />

        {loading && (
          <p className="text-center text-sm text-gray-300 animate-pulse py-12">Ачаалж байна...</p>
        )}

        {/* List */}
        <div className="flex flex-col gap-3">
          {filtered.map((s) => {
            const score = parseFloat(s.final_score_100);
            const passed = s.pass === "Тэнцсэн";
            return (
              <button
                key={s.student_id}
                onClick={() => router.push(`/student?id=${s.student_id}`)}
                className="group text-left flex items-center gap-4 border border-gray-100 rounded-xl px-5 py-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150"
              >
                {/* ID badge */}
                <div className="shrink-0 w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-mono">{s.student_id.replace("S", "")}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    <span className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full ${passed ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      {s.pass}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{s.Сэдэв}</p>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold text-gray-900">{score.toFixed(1)}</p>
                  <p className="text-[10px] text-gray-300">/100</p>
                </div>
              </button>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <p className="text-center text-sm text-gray-300 mt-16">Оюутан олдсонгүй</p>
        )}
      </div>
    </main>
  );
}

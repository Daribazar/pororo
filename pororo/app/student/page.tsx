"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type ScoreResult = {
  score: number;
  breakdown: {
    innovation: number;
    execution: number;
    report: number;
  };
  feedback: string;
};

function StudentForm() {
  const searchParams = useSearchParams();
  const [studentId, setStudentId] = useState(searchParams.get("id") ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function formatSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function pickFile(incoming: FileList | null) {
    const pdf = incoming && Array.from(incoming).find((f) => f.type === "application/pdf");
    if (pdf) {
      setFile(pdf);
      setResult(null);
      setError(null);
    }
  }

  async function submit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("pdf", file);
      form.append("student_id", studentId);

      const res = await fetch("http://localhost:5001/api/thesis/score", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Алдаа гарлаа");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Материал оруулах</h1>
      <p className="text-sm text-gray-400 mb-8">PDF файл байршуулж дипломын ажлаа үнэлүүлнэ үү</p>

      {/* Student ID */}
      <div className="w-full max-w-md mb-6">
        <label className="block text-xs text-gray-500 mb-1.5">Оюутны ID</label>
        <input
          type="text"
          placeholder="S001"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files); }}
        className={`w-full max-w-md border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-14 cursor-pointer transition-colors ${
          dragging ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0-3 3m3-3 3 3M4.5 19.5h15A2.25 2.25 0 0 0 21.75 17.25V8.25a2.25 2.25 0 0 0-2.25-2.25h-4.5L12.75 3.75H7.5A2.25 2.25 0 0 0 5.25 6v11.25A2.25 2.25 0 0 0 7.5 19.5Z" />
        </svg>
        <span className="text-sm text-gray-400">Энд чирж тавих эсвэл <span className="text-gray-600 font-medium">сонгох</span></span>
        <span className="text-xs text-gray-300">Зөвхөн PDF</span>
      </div>

      <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => pickFile(e.target.files)} />

      {/* Selected file */}
      {file && (
        <div className="w-full max-w-md mt-6 flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <svg className="w-5 h-5 text-gray-300 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <div className="min-w-0">
              <p className="text-sm text-gray-700 truncate">{file.name}</p>
              <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
            </div>
          </div>
          <button onClick={() => { setFile(null); setResult(null); setError(null); }} className="text-gray-300 hover:text-gray-500 ml-4 shrink-0">✕</button>
        </div>
      )}

      {file && !loading && !result && (
        <button
          onClick={submit}
          className="mt-4 px-6 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
        >
          Үнэлүүлэх
        </button>
      )}

      {loading && (
        <p className="mt-6 text-sm text-gray-400 animate-pulse">LLM уншиж байна...</p>
      )}

      {error && (
        <p className="mt-6 text-sm text-red-500">{error}</p>
      )}

      {/* Score result */}
      {result && (
        <div className="w-full max-w-md mt-8 border border-gray-100 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Нийт оноо</span>
            <span className="text-3xl font-bold text-gray-900">{result.score}<span className="text-base font-normal text-gray-400">/100</span></span>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { label: "Шинэлэг тал, практик ач холбогдол", value: result.breakdown.innovation, max: 35 },
              { label: "Онолийн мэдлэг, ажлын гүйцэтгэл", value: result.breakdown.execution, max: 40 },
              { label: "Тайлан боловсруулалт", value: result.breakdown.report, max: 25 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{item.label}</span>
                  <span>{item.value}/{item.max}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gray-900 h-1.5 rounded-full transition-all"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 border-t border-gray-100 pt-4">{result.feedback}</p>
        </div>
      )}
    </main>
  );
}

export default function StudentPage() {
  return (
    <Suspense>
      <StudentForm />
    </Suspense>
  );
}

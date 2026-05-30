"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function severityColor(idx: number): string {
  if (idx <= -5) return "var(--clr-red)";
  if (idx < -2) return "var(--clr-orange)";
  if (idx > 5) return "var(--clr-violet)";
  if (idx > 2) return "var(--clr-blue)";
  return "var(--clr-green)";
}

function severityLabel(idx: number): string {
  if (idx <= -5) return "Маш хатуу";
  if (idx < -2) return "Хатуу";
  if (idx > 5) return "Маш зөөлөн";
  if (idx > 2) return "Зөөлөн";
  return "Хэвийн";
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="db-bar-track">
      <div
        className="db-bar-fill"
        style={{ width: `${(value / max) * 100}%`, background: color }}
      />
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="db-stat-card" style={{ "--accent": accent } as React.CSSProperties}>
      <div className="db-stat-accent" />
      <p className="db-stat-label">{label}</p>
      <p className="db-stat-value">{value}</p>
      {sub && <p className="db-stat-sub">{sub}</p>}
    </div>
  );
}

// ─── Teacher row ─────────────────────────────────────────────────────────────

function TeacherRow({ t, rank }: { t: Teacher; rank: number }) {
  const severityIdx = parseFloat(String(t.severity_index ?? 0));
  const color = severityColor(severityIdx);
  const label = severityLabel(severityIdx);
  return (
    <div className="db-teacher-row">
      <span className="db-teacher-rank">{rank}</span>
      <div className="db-teacher-info">
        <span className="db-teacher-name">{t.name}</span>
        <span className="db-teacher-fp">{t.fingerprint}</span>
      </div>
      <div className="db-teacher-right">
        <span className="db-teacher-badge" style={{ background: color + "22", color, border: `1px solid ${color}55` }}>
          {label}
        </span>
        <span className="db-teacher-score" style={{ color }}>
          {severityIdx > 0 ? "+" : ""}
          {severityIdx.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([
          fetch("http://localhost:5001/api/summary").then((r) => r.json()),
          fetch("http://localhost:5001/api/teachers/analytics").then((r) => r.json()),
        ]);
        setSummary(s);
        setAnalytics(a);
      } catch {
        setError("Backend холбогдсонгүй. localhost:5001 ажиллаж байгаа эсэхийг шалгана уу.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="db-loading">
        <div className="db-spinner" />
        <p>Өгөгдөл татаж байна…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="db-loading">
        <p className="db-error">{error}</p>
      </div>
    );
  }

  return (
    <main className="db-root">
      {/* ── Header ── */}
      <header className="db-header">
        <div className="db-header-inner">
          <div>
            <h1 className="db-title">Хяналтын самбар</h1>
            <p className="db-subtitle">Дипломын хамгаалалтын нэгдсэн статистик</p>
          </div>
          <nav className="db-nav">
            <Link href="/" className="db-nav-link">Нүүр</Link>
            <Link href="/teachers" className="db-nav-link">Багш нар</Link>
            <Link href="/student" className="db-nav-link">Оюутан</Link>
          </nav>
        </div>
      </header>

      <div className="db-content">
        {/* ── Top stats ── */}
        {summary && (
          <>
            <section className="db-section">
              <h2 className="db-section-title">Ерөнхий мэдээлэл</h2>
              <div className="db-stats-grid">
                <StatCard label="Нийт оюутан" value={summary.totalStudents} sub="бүртгэлтэй" accent="var(--clr-blue)" />
                <StatCard label="Нийт багш" value={summary.totalTeachers} sub="үнэлгээ өгсөн" accent="var(--clr-violet)" />
                <StatCard label="Комисс" value={summary.totalCommittees} sub="хороо" accent="var(--clr-orange)" />
                <StatCard label="Тэнцсэн" value={`${summary.passRate}%`} sub="нийт оюутнаас" accent="var(--clr-green)" />
              </div>
            </section>

            {/* ── Score breakdown ── */}
            <section className="db-section">
              <h2 className="db-section-title">Онооны дүн шинжилгээ</h2>
              <div className="db-score-panel">
                <div className="db-score-hero">
                  <p className="db-score-hero-label">Дундаж оноо</p>
                  <p className="db-score-hero-val">{summary.averageFinalScore}</p>
                  <p className="db-score-hero-max">/ 100</p>
                </div>
                <div className="db-score-details">
                  {[
                    { label: "Дундаж оноо", value: summary.averageFinalScore, color: "var(--clr-blue)" },
                    { label: "Хамгийн өндөр оноо", value: summary.maxFinalScore, color: "var(--clr-green)" },
                    { label: "Хамгийн бага оноо", value: summary.minFinalScore, color: "var(--clr-red)" },
                  ].map((item) => (
                    <div key={item.label} className="db-score-row">
                      <div className="db-score-row-top">
                        <span className="db-score-row-label">{item.label}</span>
                        <span className="db-score-row-num" style={{ color: item.color }}>
                          {item.value}
                        </span>
                      </div>
                      <ScoreBar value={item.value} color={item.color} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* ── Teacher analytics ── */}
        {analytics && (
          <div className="db-teachers-grid">
            <section className="db-section">
              <h2 className="db-section-title">
                <span className="db-title-dot" style={{ background: "var(--clr-red)" }} />
                Хамгийн хатуу багш нар
              </h2>
              <p className="db-section-hint">Severity index — бага байх тусам хатуу</p>
              <div className="db-teacher-list">
                {analytics.strictest.map((t, i) => (
                  <TeacherRow key={t.id} t={t} rank={i + 1} />
                ))}
              </div>
            </section>

            <section className="db-section">
              <h2 className="db-section-title">
                <span className="db-title-dot" style={{ background: "var(--clr-violet)" }} />
                Хамгийн зөөлөн багш нар
              </h2>
              <p className="db-section-hint">Severity index — өндөр байх тусам зөөлөн</p>
              <div className="db-teacher-list">
                {analytics.mostLenient.map((t, i) => (
                  <TeacherRow key={t.id} t={t} rank={i + 1} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ── All teachers score table ── */}
        {analytics && (
          <section className="db-section">
            <h2 className="db-section-title">Бүх багшийн дундаж оноо</h2>
            <div className="db-table-wrap">
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Нэр</th>
                    <th>Дундаж оноо</th>
                    <th>Severity</th>
                    <th>Noise</th>
                    <th>Үнэлсэн</th>
                    <th>Ангилал</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.teachers.map((t) => {
                    const avgAll = parseFloat(String(t.avg_all ?? 0));
                    const severityIdx = parseFloat(String(t.severity_index ?? 0));
                    const noise = parseFloat(String(t.noise ?? 0));
                    const color = severityColor(severityIdx);
                    return (
                      <tr key={t.id}>
                        <td className="db-table-name">{t.name}</td>
                        <td>
                          <div className="db-table-score-wrap">
                            <span style={{ color, fontWeight: 600 }}>{avgAll.toFixed(1)}</span>
                            <ScoreBar value={avgAll} max={40} color={color} />
                          </div>
                        </td>
                        <td style={{ color, fontWeight: 600 }}>
                          {severityIdx > 0 ? "+" : ""}{severityIdx.toFixed(1)}
                        </td>
                        <td className="db-table-muted">{noise.toFixed(1)}</td>
                        <td className="db-table-muted">{t.graders_count}</td>
                        <td>
                          <span
                            className="db-badge"
                            style={{ background: color + "18", color, border: `1px solid ${color}44` }}
                          >
                            {t.severity_category}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
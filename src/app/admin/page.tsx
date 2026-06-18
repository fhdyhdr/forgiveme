"use client";

import { useState } from "react";

type SummaryItem = {
  personLabel: string;
  visitorId: string;
  apologyYes: number;
  apologyNo: number;
  loveQuestionYes: number;
  loveQuestionNo: number;
  finalReset: number;
  totalClicks: number;
  lastClickAt: string | null;
};

type ClickEvent = {
  id: string;
  visitor_id: string;
  person_label: string;
  stage: "apology" | "loveQuestion" | "final";
  action: "yes" | "no" | "reset";
  no_count: number;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [summary, setSummary] = useState<SummaryItem[]>([]);
  const [events, setEvents] = useState<ClickEvent[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/stats?password=${encodeURIComponent(password)}`
      );

      const result = await response.json();

      if (!result.success) {
        setMessage(result.message || "Gagal mengambil data.");
        setSummary([]);
        setEvents([]);
        return;
      }

      setSummary(result.summary || []);
      setEvents(result.events || []);
    } catch {
      setMessage("Terjadi kesalahan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="adminPage">
      <section className="adminCard">
        <div className="badge">admin dashboard</div>

        <h1 className="adminTitle">Data Klik Website</h1>

        <p className="adminDescription">
          Masukkan password admin untuk melihat siapa yang klik Yes dan No.
        </p>

        <div className="adminForm">
          <input
            type="password"
            placeholder="Masukkan password admin"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button onClick={loadStats} disabled={loading}>
            {loading ? "Mengambil..." : "Lihat Data"}
          </button>
        </div>

        {message && <p className="adminMessage">{message}</p>}

        {summary.length > 0 && (
          <>
            <h2 className="sectionTitle">Ringkasan</h2>

            <div className="tableWrapper">
              <table>
                <thead>
                <tr>
                  <th>Person</th>
                  <th>Apology Yes</th>
                  <th>Apology No</th>
                  <th>Pacar Yes</th>
                  <th>Pacar No</th>
                  <th>Ulangi</th>
                  <th>Total</th>
                  <th>Terakhir Klik</th>
                </tr>
                </thead>

                <tbody>
                  {summary.map((item) => (
                    <tr key={`${item.personLabel}-${item.visitorId}`}>
                      <td>
                        <strong>{item.personLabel}</strong>
                        <br />
                        <span>{item.visitorId.slice(0, 8)}...</span>
                      </td>
                      <td>{item.apologyYes}</td>
                      <td>{item.apologyNo}</td>
                      <td>{item.loveQuestionYes}</td>
                      <td>{item.loveQuestionNo}</td>
                      <td>{item.finalReset}</td>
                      <td>{item.totalClicks}</td>
                      <td>
                        {item.lastClickAt
                          ? new Date(item.lastClickAt).toLocaleString("id-ID")
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {events.length > 0 && (
          <>
            <h2 className="sectionTitle">Riwayat Klik Terbaru</h2>

            <div className="eventList">
              {events.map((event) => (
                <div className="eventItem" key={event.id}>
                  <div>
                    <strong>{event.person_label}</strong>{" "}
                    <span>
                      klik {event.action.toUpperCase()} di {event.stage}
                    </span>
                  </div>

                  <small>
                    No count: {event.no_count} •{" "}
                    {new Date(event.created_at).toLocaleString("id-ID")}
                  </small>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
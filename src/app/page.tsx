"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Step = "apology" | "loveQuestion" | "final";

type TrackStage = "apology" | "loveQuestion" | "final";

type TrackAction = "yes" | "no" | "reset";

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `visitor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  const [step, setStep] = useState<Step>("apology");
  const [noCounter, setNoCounter] = useState(0);
  const [visitorId, setVisitorId] = useState("");
  const [personLabel, setPersonLabel] = useState("unknown");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clickLockRef = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const personFromUrl = searchParams.get("person");

    const savedPersonLabel = localStorage.getItem("love_person_label");
    const finalPersonLabel = personFromUrl || savedPersonLabel || "unknown";

    localStorage.setItem("love_person_label", finalPersonLabel);
    setPersonLabel(finalPersonLabel);

    const savedVisitorId = localStorage.getItem("love_visitor_id");

    if (savedVisitorId) {
      setVisitorId(savedVisitorId);
      return;
    }

    const newVisitorId = createVisitorId();
    localStorage.setItem("love_visitor_id", newVisitorId);
    setVisitorId(newVisitorId);
  }, []);

  const noButtonText = useMemo(() => {
    const texts = [
      "No",
      "Yakin?",
      "Coba pikir lagi",
      "Eits, jangan dulu",
      "No-nya lagi error",
      "Klik Yes aja",
      "Aku tunggu Yes",
      "Tombol No gak mau dipencet",
    ];

    return texts[Math.min(noCounter, texts.length - 1)];
  }, [noCounter]);

  const yesScale = Math.min(1 + noCounter * 0.15, 2.1);

  const trackClick = async (
    stage: TrackStage,
    action: TrackAction,
    currentNoCount: number
  ) => {
    if (!visitorId) return;

    try {
      await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visitorId,
          personLabel,
          stage,
          action,
          noCount: currentNoCount,
        }),
      });
    } catch {
      console.log("Tracking gagal dikirim.");
    }
  };

  const unlockClick = () => {
    setTimeout(() => {
      clickLockRef.current = false;
      setIsSubmitting(false);
    }, 400);
  };

  const handleNoClick = () => {
    const nextNoCounter = noCounter + 1;
    setNoCounter(nextNoCounter);

    if (step === "apology") {
      void trackClick("apology", "no", nextNoCounter);
    }

    if (step === "loveQuestion") {
      void trackClick("loveQuestion", "no", nextNoCounter);
    }
  };

  const handleFirstYes = () => {
    if (clickLockRef.current) return;

    clickLockRef.current = true;
    setIsSubmitting(true);

    const currentNoCounter = noCounter;

    setStep("loveQuestion");
    setNoCounter(0);

    void trackClick("apology", "yes", currentNoCounter);

    unlockClick();
  };

  const handleSecondYes = () => {
    if (clickLockRef.current) return;

    clickLockRef.current = true;
    setIsSubmitting(true);

    const currentNoCounter = noCounter;

    setStep("final");
    setNoCounter(0);

    void trackClick("loveQuestion", "yes", currentNoCounter);

    unlockClick();
  };

  const handleReset = () => {
    if (clickLockRef.current) return;

    clickLockRef.current = true;
    setIsSubmitting(true);

    const currentNoCounter = noCounter;

    setStep("apology");
    setNoCounter(0);

    void trackClick("final", "reset", currentNoCounter);

    unlockClick();
  };

  return (
    <main className="page">
      <div className="backgroundBlob blobOne" />
      <div className="backgroundBlob blobTwo" />
      <div className="backgroundBlob blobThree" />

      <div className="floatingHearts" aria-hidden="true">
        <span>♡</span>
        <span>✦</span>
        <span>♡</span>
        <span>✧</span>
        <span>♡</span>
      </div>

      <section className="card">
        <div className="badge">
          for someone special <br /> (bang Shaazin)
        </div>

        {step === "apology" && (
          <>
            <h1 className="title">
              Maafin aku ya,
              <span> banggggg</span>
            </h1>

            <p className="description">
              Bang, aku minta maaf buat yang kemarin. Aku malah ngulangin
              kesalahan yang sama, dan itu pasti bikin kamu capek, kecewa.
              <br />
              Dimaafin kan ya?
            </p>

            <div className="messageBox">
              <p>
                Kalau kamu maafin aku, klik tombol <strong>Yes</strong>. Kalau
                klik <strong>No</strong>, tombol Yes bakal tambah besar karena
                alam semesta sedang membela aku.
              </p>
            </div>

            <div className="buttonGroup">
              <button
                className="yesButton"
                disabled={isSubmitting}
                style={{
                  transform: `scale(${yesScale})`,
                }}
                onClick={handleFirstYes}
              >
                {isSubmitting ? "Sebentar..." : "Yes, aku maafin"}
              </button>

              <button
                className="noButton"
                disabled={isSubmitting}
                onClick={handleNoClick}
              >
                {noButtonText}
              </button>
            </div>

            {noCounter > 0 && (
              <p className="hintText">
                Percobaan menolak ke-{noCounter}. Sistem mendeteksi kamu
                sebenarnya mau klik Yes.
              </p>
            )}
          </>
        )}

        {step === "loveQuestion" && (
          <>
            <p className="smallText">Makasih bang udah maafin aku.</p>

            <h1 className="title">
              Tapi aku masih punya
              <span> satu pertanyaan lagi...</span>
            </h1>

            <div className="questionBox">
              <h2>Beneran gak mau jadi pacarku? 3 menit aja deh</h2>
            </div>

            <div className="buttonGroup">
              <button
                className="yesButton"
                disabled={isSubmitting}
                style={{
                  transform: `scale(${yesScale})`,
                }}
                onClick={handleSecondYes}
              >
                {isSubmitting ? "Sebentar..." : "Yes, aku mau"}
              </button>

              <button
                className="noButton"
                disabled={isSubmitting}
                onClick={handleNoClick}
              >
                {noButtonText}
              </button>
            </div>

            {noCounter > 0 && (
              <p className="hintText">
                Klik No ke-{noCounter}. Tombol Yes makin besar. Ini bukan bug,
                ini strategi romantis.
              </p>
            )}
          </>
        )}

        {step === "final" && (
          <>
            <div className="successIcon">♡</div>

            <p className="smallText">Yeay, akhirnya!</p>

            <h1 className="title">
              Resmi diterima?
              <span> ya walaupun cuma 3 menit.</span>
            </h1>

            <p className="description">
              Aku janji, 3 menit ini gak bakal aku sia-siakan. Makasih ya udah
              kasih aku kesempatan, meskipun cuma sebentar.
            </p>

            <div className="finalBox">
              <p>
                Mulai dari sekarang, 3 menit ke depan adalah waktu paling
                berharga buat aku. Tenang, aku bakal jadi pacar yang baik...
                versi trial dulu.
              </p>
            </div>

            <button
              className="resetButton"
              disabled={isSubmitting}
              onClick={handleReset}
            >
              {isSubmitting ? "Mengulang..." : "Ulangi dari awal"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
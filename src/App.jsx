import React, { useState, useMemo } from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";

// --- Règles fiscales Madagascar (Loi n°2025-021, en vigueur depuis le 1er janvier 2026) ---
const PLAFOND_COTIS = 21014; // plafond CNaPS / OSTIE = 1% x 8 x SME
const TAUX_CNAPS = 0.01;
const TAUX_OSTIE = 0.01;

const IS_REGIMES = {
  standard: { label: "Régime standard", taux: 0.05 },
  cga: { label: "Nouvel adhérent CGA", taux: 0.03 },
};

function calculCotisation(brut) {
  return Math.min(brut * TAUX_CNAPS, PLAFOND_COTIS);
}

function calculIRSA(base, enfants) {
  const t1 = Math.min(Math.max(0, base - 350000), 50000) * 0.05;
  const t2 = Math.min(Math.max(0, base - 400000), 100000) * 0.10;
  const t3 = Math.min(Math.max(0, base - 500000), 100000) * 0.15;
  const t4 = Math.min(Math.max(0, base - 600000), 3400000) * 0.20;
  const t5 = Math.max(0, base - 4000000) * 0.25;
  const brut = t1 + t2 + t3 + t4 + t5 - 2000 * Math.min(enfants, 6);
  return Math.max(3000, brut);
}

function ariary(n) {
  if (!isFinite(n)) n = 0;
  return Math.round(n).toLocaleString("fr-FR") + " Ar";
}

function AdSlot({ label }) {
  return (
    <div
      className="w-full flex items-center justify-center text-[10px] tracking-[0.18em] uppercase"
      style={{
        background: "#F1F3F6",
        border: "1px solid #DDE3EA",
        color: "#8A93A0",
        padding: "10px 12px",
        borderRadius: "2px",
      }}
    >
      {label}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("salarie");
  const [brut, setBrut] = useState("500000");
  const [enfants, setEnfants] = useState("0");
  const [ca, setCa] = useState("1500000");
  const [regimeIS, setRegimeIS] = useState("standard");

  const r = useMemo(() => {
    if (mode === "salarie") {
      const b = parseFloat(brut) || 0;
      const nEnfants = parseInt(enfants) || 0;
      const cnaps = calculCotisation(b);
      const ostie = calculCotisation(b);
      const baseIRSA = Math.floor((b - cnaps - ostie) / 100) * 100;
      const irsa = calculIRSA(baseIRSA, nEnfants);
      const net = b - cnaps - ostie - irsa;
      return {
        brutMensuel: b,
        net,
        netAnnuel: net * 12,
        lignes: [
          { label: "Salaire brut", montant: b, base: true },
          { label: "CNaPS (1 %)", montant: -cnaps },
          { label: "OSTIE (1 %)", montant: -ostie },
          { label: "IRSA", montant: -irsa },
        ],
        tauxConserve: b > 0 ? (net / b) * 100 : 0,
      };
    } else {
      const c = parseFloat(ca) || 0;
      const taux = IS_REGIMES[regimeIS].taux;
      const impot = c * taux;
      const net = c - impot;
      return {
        brutMensuel: c,
        net,
        netAnnuel: net * 12,
        lignes: [
          { label: "Chiffre d'affaires", montant: c, base: true },
          { label: `Impôt Synthétique (${(taux * 100).toFixed(0)} %)`, montant: -impot },
        ],
        tauxConserve: c > 0 ? (net / c) * 100 : 0,
      };
    }
  }, [mode, brut, enfants, ca, regimeIS]);

  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#EEF1F5" }}>
      <div className="w-full max-w-md flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* Header bar */}
        <header style={{ background: "#0F1F3D" }} className="px-5 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={16} style={{ color: "#B8912F" }} />
            <span
              className="text-[10px] tracking-[0.22em] uppercase"
              style={{ color: "#B8912F", fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Madagasikara · Loi de Finances 2026
            </span>
          </div>
          <h1
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F7F9FB", fontWeight: 600, fontSize: "24px", lineHeight: 1.25 }}
          >
            Calculateur de revenu net
          </h1>
          <p className="text-sm mt-1" style={{ color: "#9AA7BD" }}>
            IRSA · CNaPS · OSTIE · Impôt Synthétique
          </p>
        </header>

        <div className="px-4 -mt-3 flex flex-col gap-4 pb-8">

          <AdSlot label="Espace publicitaire" />

          {/* Mode switch */}
          <div className="flex rounded-sm overflow-hidden bg-white" style={{ border: "1px solid #DDE3EA" }}>
            {[
              { key: "salarie", label: "Salarié" },
              { key: "is", label: "Indépendant" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key)}
                className="flex-1 py-3 text-sm font-medium transition-colors"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: mode === opt.key ? "#0F1F3D" : "transparent",
                  color: mode === opt.key ? "#F7F9FB" : "#64748B",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Inputs card */}
          <div className="bg-white p-4 flex flex-col gap-3" style={{ border: "1px solid #DDE3EA" }}>
            {mode === "salarie" ? (
              <>
                <Field label="Salaire brut mensuel (Ar)" value={brut} onChange={setBrut} placeholder="500000" />
                <Field label="Personnes à charge (max 6)" value={enfants} onChange={setEnfants} placeholder="0" small />
              </>
            ) : (
              <>
                <Field label="Chiffre d'affaires mensuel (Ar)" value={ca} onChange={setCa} placeholder="1500000" />
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-wide" style={{ color: "#64748B" }}>Régime</span>
                  <div className="relative">
                    <select
                      value={regimeIS}
                      onChange={(e) => setRegimeIS(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm"
                      style={{ background: "#F7F9FB", border: "1px solid #DDE3EA", color: "#0F1F3D" }}
                    >
                      {Object.entries(IS_REGIMES).map(([key, v]) => (
                        <option key={key} value={key}>{v.label} ({(v.taux * 100).toFixed(0)} %)</option>
                      ))}
                    </select>
                    <ChevronDown size={16} style={{ position: "absolute", right: "12px", top: "12px", color: "#64748B", pointerEvents: "none" }} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Statement — signature element */}
          <div className="relative bg-white" style={{ border: "1px solid #DDE3EA" }}>
            <div
              className="px-4 py-3 flex justify-between items-center"
              style={{ borderBottom: "1px solid #DDE3EA" }}
            >
              <span
                className="text-[10px] uppercase tracking-[0.18em]"
                style={{ color: "#64748B", fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Relevé estimatif
              </span>
              <span className="text-[10px]" style={{ color: "#9AA7BD", fontFamily: "'IBM Plex Mono', monospace" }}>
                {today}
              </span>
            </div>

            <div className="px-4 py-3 flex flex-col gap-2.5">
              {r.lignes.map((l, i) => (
                <div key={i} className="flex justify-between items-baseline text-sm">
                  <span style={{ color: l.base ? "#0F1F3D" : "#64748B", fontWeight: l.base ? 600 : 400 }}>
                    {l.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: l.montant < 0 ? "#A63D2F" : "#0F1F3D",
                      fontWeight: l.base ? 600 : 400,
                    }}
                  >
                    {l.montant < 0 ? "− " : ""}{ariary(Math.abs(l.montant))}
                  </span>
                </div>
              ))}
            </div>

            {/* Net summary band */}
            <div className="px-4 py-4 flex flex-col gap-1" style={{ background: "#0F1F3D" }}>
              <div className="flex justify-between items-baseline">
                <span
                  className="text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "#B8912F", fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Net mensuel
                </span>
                <span className="text-[11px]" style={{ color: "#7FB894", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {r.tauxConserve.toFixed(0)} % conservé
                </span>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "30px", fontWeight: 700, color: "#F7F9FB" }}>
                {ariary(r.net)}
              </span>
              <span className="text-xs mt-0.5" style={{ color: "#9AA7BD", fontFamily: "'IBM Plex Mono', monospace" }}>
                {ariary(r.netAnnuel)} / an
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>
            Estimation basée sur la Loi de Finances 2026 (Loi n° 2025-021) : barème IRSA à 6 tranches,
            CNaPS et OSTIE plafonnées à {ariary(PLAFOND_COTIS)}/mois, minimum d'IRSA {ariary(3000)}.
            Impôt Synthétique valable pour un CA annuel inférieur à 200 M Ar. Pour un calcul officiel,
            utilise le simulateur de la DGI (impots.mg) ou consulte un expert-comptable agréé.
          </p>

          <AdSlot label="Espace publicitaire" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, small }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide" style={{ color: "#64748B" }}>{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 ${small ? "text-base" : "text-lg"}`}
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          background: "#F7F9FB",
          border: "1px solid #DDE3EA",
          color: "#0F1F3D",
        }}
      />
    </label>
  );
}

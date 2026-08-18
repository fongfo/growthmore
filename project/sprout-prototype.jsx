import React, { useState, useEffect, useRef } from "react";

/*  ──────────────────────────────────────────────────────────────
    SPROUT — a bank-white-label Gen-Z literacy sandbox prototype
    The loop:  Earn  →  Allocate  →  Grow (simulated)  →  Collect (real reward)
    "Virtual balance" is programme points. "Reward jar" holds REAL cash,
    funded from the bank's marketing budget, withdrawable monthly.
    Every user-facing string keeps the language firewall:
       simulated balance ≠ real money  |  reward coupon ≠ investment return
    ────────────────────────────────────────────────────────────── */

const C = {
  ink: "#141B2E",
  sub: "#6B7488",
  line: "#ECEEF3",
  card: "#FFFFFF",
  bg: "#F4F6FB",
  mint: "#12B886",
  mintSoft: "#E4F7EF",
  grape: "#6C5CE7",
  grapeSoft: "#EEEBFF",
  gold: "#F4B400",
  goldSoft: "#FFF4D6",
  coral: "#FF6B6B",
  coralSoft: "#FFE9E9",
  sky: "#3BA4F4",
  skySoft: "#E4F1FE",
};

const CAP = 500000; // virtual balance ceiling (points, "Rp"-styled)

const INSTRUMENTS = [
  { id: "deposit", name: "Sprout Deposit", tag: "Steady", yield: 0.6, vol: 0.0,
    color: C.mint, soft: C.mintSoft, icon: "🏦",
    blurb: "Fixed, predictable. Like a term deposit — it just ticks up." },
  { id: "bond", name: "Gov Coupon Bond", tag: "Fixed coupon", yield: 0.85, vol: 0.02,
    color: C.grape, soft: C.grapeSoft, icon: "📜",
    blurb: "A simulated fixed-coupon govvie. Non-tradable, pays a set coupon." },
  { id: "gold", name: "Gold", tag: "Commodity", yield: 1.1, vol: 0.55,
    color: C.gold, soft: C.goldSoft, icon: "🪙",
    blurb: "Tradable. Can swing up and down — this is where you feel volatility." },
  { id: "mmf", name: "Money Market Fund", tag: "Low risk", yield: 0.75, vol: 0.08,
    color: C.sky, soft: C.skySoft, icon: "💧",
    blurb: "Simulated money-market fund. Gentle, liquid, mild wobble." },
  { id: "balanced", name: "Balanced Fund", tag: "Growth", yield: 1.25, vol: 0.35,
    color: C.coral, soft: C.coralSoft, icon: "⚖️",
    blurb: "Simulated balanced fund. More upside, more movement than the MMF." },
];

const rp = (n) => "Rp" + Math.round(n).toLocaleString("id-ID");

/* ── tiny reusable UI atoms ─────────────────────────────────── */
const Pill = ({ children, bg, fg }) => (
  <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 700,
    padding: "3px 9px", borderRadius: 999, letterSpacing: .2 }}>{children}</span>
);

function Ring({ pct, color, size = 54, stroke = 6 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.line} strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)" }}/>
    </svg>
  );
}

/* ── the app ────────────────────────────────────────────────── */
export default function Sprout() {
  const [tab, setTab] = useState("earn");      // earn | allocate | grow | jar
  const [balance, setBalance] = useState(85000); // virtual points earned
  const [alloc, setAlloc] = useState({});       // {id: amount of virtual balance}
  const [monthsRun, setMonthsRun] = useState(0);
  const [jar, setJar] = useState(0);            // REAL reward rupiah accrued
  const [collected, setCollected] = useState(0);
  const [toast, setToast] = useState(null);
  const [windowOpen, setWindowOpen] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [pulse, setPulse] = useState(false);

  const allocated = Object.values(alloc).reduce((a, b) => a + b, 0);
  const free = balance - allocated;

  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 1900); };

  /* EARN actions — each is a literacy behaviour, capped at ceiling */
  const earn = (amt, label) => {
    setBalance((b) => {
      const next = Math.min(CAP, b + amt);
      if (next === b) flash("You've hit the balance ceiling ✋");
      else flash(`+${rp(next - b)} — ${label}`);
      return next;
    });
    setPulse(true); setTimeout(() => setPulse(false), 400);
  };

  /* SIMULATE one month: instruments move, reward coupon accrues (real Rp) */
  const runMonth = () => {
    if (allocated === 0) { flash("Allocate some balance first 👆"); return; }
    let coupon = 0;
    const nextAlloc = { ...alloc };
    INSTRUMENTS.forEach((ins) => {
      const amt = alloc[ins.id] || 0;
      if (!amt) return;
      // simulated value drift (can lose value — it's a sandbox)
      const drift = 1 + (ins.yield / 100) + (Math.random() - 0.5) * ins.vol / 100 * 4;
      nextAlloc[ins.id] = Math.max(0, amt * drift);
      // REAL reward coupon: deterministic %, funded by bank marketing budget
      coupon += amt * (ins.yield / 100) * 12; // scaled up so demo shows real Rp
    });
    setAlloc(nextAlloc);
    setJar((j) => j + coupon);
    setMonthsRun((m) => m + 1);
    flash(`Month simulated · +${rp(coupon)} reward → jar`);
    if ((monthsRun + 1) % 1 === 0) setWindowOpen(true); // demo: window opens each cycle
  };

  const collect = () => {
    if (!windowOpen) { flash("Withdrawal window is closed 🔒"); return; }
    setCollected((c) => c + jar);
    flash(`${rp(jar)} sent to your real account 🎉`);
    setJar(0); setWindowOpen(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#E7EAF3", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

      {/* phone frame */}
      <div style={{ width: 390, height: 800, background: C.bg, borderRadius: 42,
        boxShadow: "0 40px 90px rgba(20,27,46,.28)", overflow: "hidden",
        position: "relative", border: "10px solid #10131C", display: "flex", flexDirection: "column" }}>

        {/* status bar */}
        <div style={{ height: 44, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 24px", color: C.ink,
          fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>sprout</span>
          <span>􀛨 􀙇 100%</span>
        </div>

        {/* header */}
        <div style={{ padding: "6px 22px 14px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Learning balance</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.ink, letterSpacing: -.5,
                transform: pulse ? "scale(1.05)" : "scale(1)", transition: "transform .3s" }}>
                {rp(balance)}
              </div>
              <div style={{ fontSize: 10.5, color: C.sub, marginTop: 1 }}>
                simulated points · not real money · ceiling {rp(CAP)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>Reward jar</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.mint }}>{rp(jar)}</div>
              <div style={{ fontSize: 10.5, color: C.sub }}>real Rp · monthly window</div>
            </div>
          </div>
          {/* ceiling bar */}
          <div style={{ height: 6, background: C.line, borderRadius: 999, marginTop: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(balance/CAP)*100}%`,
              background: `linear-gradient(90deg, ${C.mint}, ${C.grape})`, borderRadius: 999,
              transition: "width .5s" }}/>
          </div>
        </div>

        {/* scroll body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 16px" }}>
          {tab === "earn" && <Earn earn={earn} quizIdx={quizIdx} setQuizIdx={setQuizIdx}/>}
          {tab === "allocate" && <Allocate {...{ alloc, setAlloc, free, balance, flash }}/>}
          {tab === "grow" && <Grow {...{ alloc, runMonth, monthsRun }}/>}
          {tab === "jar" && <Jar {...{ jar, windowOpen, collect, collected, monthsRun }}/>}
        </div>

        {/* toast */}
        {toast && (
          <div style={{ position: "absolute", bottom: 96, left: "50%", transform: "translateX(-50%)",
            background: C.ink, color: "#fff", fontSize: 12.5, fontWeight: 600,
            padding: "10px 16px", borderRadius: 14, whiteSpace: "nowrap",
            boxShadow: "0 10px 30px rgba(20,27,46,.35)", zIndex: 20 }}>{toast}</div>
        )}

        {/* tab bar */}
        <div style={{ height: 78, background: "#fff", borderTop: `1px solid ${C.line}`,
          display: "flex", flexShrink: 0, padding: "8px 8px 20px" }}>
          {[
            ["earn", "Earn", "✨"],
            ["allocate", "Allocate", "🧩"],
            ["grow", "Grow", "📈"],
            ["jar", "Jar", "🫙"],
          ].map(([id, label, ic]) => {
            const on = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: "none",
                background: "none", cursor: "pointer", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3, color: on ? C.grape : C.sub }}>
                <div style={{ width: 46, height: 30, borderRadius: 12, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 17,
                  background: on ? C.grapeSoft : "transparent", transition: "background .2s" }}>{ic}</div>
                <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── STEP 1 · EARN ──────────────────────────────────────────── */
function Earn({ earn, quizIdx, setQuizIdx }) {
  const quiz = [
    { q: "Which usually moves the most day to day?", a: ["Term deposit", "Gold"], correct: 1 },
    { q: "A money market fund is best described as…", a: ["High risk, high reward", "Low risk, liquid"], correct: 1 },
    { q: "A fixed-coupon bond pays…", a: ["A set, known amount", "Whatever the market feels"], correct: 0 },
  ];
  const [answered, setAnswered] = useState(null);
  const Q = quiz[quizIdx % quiz.length];

  return (
    <div>
      <SectionTitle n="01" t="Earn your balance" s="Do a small money-smart action, grow your sandbox."/>
      {/* daily streak */}
      <div style={{ background: `linear-gradient(135deg, ${C.grape}, #8B7DF0)`, borderRadius: 20,
        padding: 18, color: "#fff", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>🔥 5-day streak</div>
            <div style={{ fontSize: 11, opacity: .8, marginTop: 2 }}>Check in daily to keep it alive</div>
          </div>
          <button onClick={() => earn(5000, "Daily check-in")} style={btnLight}>Check in +Rp5.000</button>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
          {[1,1,1,1,1,0,0].map((on,i)=>(
            <div key={i} style={{ flex:1, height:6, borderRadius:999,
              background: on ? "#fff" : "rgba(255,255,255,.3)" }}/>
          ))}
        </div>
      </div>

      {/* learn & earn quiz */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>Learn &amp; earn</span>
          <Pill bg={C.mintSoft} fg={C.mint}>+Rp8.000</Pill>
        </div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink, marginBottom: 12 }}>{Q.q}</div>
        <div style={{ display: "flex", gap: 8 }}>
          {Q.a.map((opt, i) => {
            const state = answered === null ? "idle" : i === Q.correct ? "right" : i === answered ? "wrong" : "idle";
            return (
              <button key={i} onClick={() => {
                if (answered !== null) return;
                setAnswered(i);
                if (i === Q.correct) earn(8000, "Correct answer");
                setTimeout(() => { setAnswered(null); setQuizIdx((x)=>x+1); }, 1100);
              }} style={{ flex: 1, padding: "12px 8px", borderRadius: 14, cursor: "pointer",
                fontSize: 12.5, fontWeight: 700, border: `1.5px solid ${
                  state==="right"?C.mint:state==="wrong"?C.coral:C.line}`,
                background: state==="right"?C.mintSoft:state==="wrong"?C.coralSoft:"#fff",
                color: state==="right"?C.mint:state==="wrong"?C.coral:C.ink, transition: "all .2s" }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* other earn actions */}
      {[
        ["Link your salary", "Connect payroll to unlock a boost", 12000, "💼"],
        ["Refer a friend", "They join, you both grow", 15000, "🤝"],
        ["Round-up a purchase", "Save the spare change, earn points", 3000, "🪙"],
      ].map(([t, s, amt, ic]) => (
        <button key={t} onClick={() => earn(amt, t)} style={{ ...cardStyle, width: "100%",
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
          <div style={{ fontSize: 22 }}>{ic}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>{t}</div>
            <div style={{ fontSize: 11.5, color: C.sub }}>{s}</div>
          </div>
          <Pill bg={C.grapeSoft} fg={C.grape}>+{rp(amt)}</Pill>
        </button>
      ))}
    </div>
  );
}

/* ── STEP 2 · ALLOCATE ──────────────────────────────────────── */
function Allocate({ alloc, setAlloc, free, balance, flash }) {
  const [sel, setSel] = useState(null);
  const set = (id, v) => setAlloc((a) => ({ ...a, [id]: v }));

  return (
    <div>
      <SectionTitle n="02" t="Allocate your balance" s="Split it across instruments. Feel how each behaves."/>
      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>Unallocated</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{rp(free)}</div>
        </div>
        <button onClick={() => { setAlloc({}); flash("Cleared allocations"); }}
          style={{ ...btnGhost }}>Reset</button>
      </div>

      {INSTRUMENTS.map((ins) => {
        const amt = alloc[ins.id] || 0;
        const max = amt + free;
        const open = sel === ins.id;
        return (
          <div key={ins.id} style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
            <button onClick={() => setSel(open ? null : ins.id)} style={{ width: "100%", border: "none",
              background: "none", padding: 14, display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: ins.soft,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{ins.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>{ins.name}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                  <Pill bg={ins.soft} fg={ins.color}>{ins.tag}</Pill>
                  <Pill bg={C.line} fg={C.sub}>~{ins.yield}%/mo coupon</Pill>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: amt ? ins.color : C.sub }}>{rp(amt)}</div>
                <div style={{ fontSize: 16, color: C.sub, transform: open?"rotate(180deg)":"none",
                  transition: "transform .2s" }}>⌄</div>
              </div>
            </button>
            {open && (
              <div style={{ padding: "0 14px 16px" }}>
                <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, lineHeight: 1.5 }}>{ins.blurb}</div>
                <input type="range" min={0} max={max} value={amt} step={1000}
                  onChange={(e) => set(ins.id, +e.target.value)}
                  style={{ width: "100%", accentColor: ins.color }}/>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: C.sub }}>Rp0</span>
                  <span style={{ fontSize: 11, color: C.sub }}>max {rp(max)}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ fontSize: 10.5, color: C.sub, textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>
        These are simulated instruments for learning. Your balance can rise or fall.<br/>You never hold real securities.
      </div>
    </div>
  );
}

/* ── STEP 3 · GROW ──────────────────────────────────────────── */
function Grow({ alloc, runMonth, monthsRun }) {
  const allocated = Object.values(alloc).reduce((a,b)=>a+b,0);
  return (
    <div>
      <SectionTitle n="03" t="Grow &amp; feel returns" s="Run a month. Watch value move, watch real reward accrue."/>
      {allocated === 0 ? (
        <EmptyState icon="🧩" title="Nothing allocated yet"
          body="Head to Allocate and split your balance across a few instruments first."/>
      ) : (
        <>
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: C.sub, fontWeight: 600, marginBottom: 12 }}>
              Portfolio mix · {monthsRun} {monthsRun===1?"month":"months"} simulated
            </div>
            {INSTRUMENTS.map((ins) => {
              const amt = alloc[ins.id] || 0;
              if (!amt) return null;
              const pct = amt / allocated;
              return (
                <div key={ins.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <Ring pct={pct} color={ins.color} size={40} stroke={5}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{ins.name}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{rp(amt)} · {Math.round(pct*100)}% of mix</div>
                  </div>
                  <Pill bg={ins.soft} fg={ins.color}>+{ins.yield}%</Pill>
                </div>
              );
            })}
          </div>
          <button onClick={runMonth} style={{ ...btnPrimary, width: "100%" }}>
            ▶ Simulate one month
          </button>
          <div style={{ fontSize: 10.5, color: C.sub, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>
            Each simulated month, the deterministic reward coupon is paid in <b>real rupiah</b><br/>
            into your jar — funded by the bank, not drawn from your balance.
          </div>
        </>
      )}
    </div>
  );
}

/* ── STEP 4 · JAR ───────────────────────────────────────────── */
function Jar({ jar, windowOpen, collect, collected, monthsRun }) {
  return (
    <div>
      <SectionTitle n="04" t="Collect your reward" s="Real cash. Opens once a month. Miss it, it waits."/>
      <div style={{ background: `linear-gradient(160deg, ${C.mint}, #0FA372)`, borderRadius: 24,
        padding: 24, color: "#fff", textAlign: "center", marginBottom: 14,
        boxShadow: "0 20px 40px rgba(18,184,134,.28)" }}>
        <div style={{ fontSize: 40, marginBottom: 6 }}>🫙</div>
        <div style={{ fontSize: 12, opacity: .85, fontWeight: 600 }}>In your reward jar</div>
        <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>{rp(jar)}</div>
        <div style={{ fontSize: 11, opacity: .85 }}>real rupiah · withdrawable to your account</div>
        <div style={{ marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,.18)", padding: "5px 12px", borderRadius: 999,
          fontSize: 11.5, fontWeight: 700 }}>
          {windowOpen ? "🟢 Window open — collect now" : "🔒 Window opens after next cycle"}
        </div>
      </div>

      <button onClick={collect} disabled={!windowOpen || jar===0}
        style={{ ...btnPrimary, width: "100%", opacity: (!windowOpen||jar===0)?.45:1,
          background: windowOpen? C.ink : C.sub }}>
        {windowOpen ? `Withdraw ${rp(jar)} to my account` : "Withdrawal window closed"}
      </button>

      <div style={{ ...cardStyle, marginTop: 14, display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>Collected all-time</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{rp(collected)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>Months simulated</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{monthsRun}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 14, background: C.grapeSoft, border: "none" }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: C.grape, marginBottom: 4 }}>
          Ready for the real thing? →
        </div>
        <div style={{ fontSize: 12, color: C.ink, lineHeight: 1.5 }}>
          You've learned how a balanced fund and gold behave differently. Open a real
          Reksa Dana with the bank in two taps.
        </div>
      </div>
    </div>
  );
}

/* ── shared bits ────────────────────────────────────────────── */
function SectionTitle({ n, t, s }) {
  return (
    <div style={{ margin: "8px 4px 14px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.grape, letterSpacing: 1 }}>{n}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.ink }} dangerouslySetInnerHTML={{__html:t}}/>
      </div>
      <div style={{ fontSize: 12.5, color: C.sub, marginTop: 3 }}>{s}</div>
    </div>
  );
}
function EmptyState({ icon, title, body }) {
  return (
    <div style={{ ...cardStyle, textAlign: "center", padding: 30 }}>
      <div style={{ fontSize: 34, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.sub, marginTop: 4, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

const cardStyle = { background: C.card, borderRadius: 18, padding: 14, marginBottom: 12,
  border: `1px solid ${C.line}`, boxShadow: "0 2px 10px rgba(20,27,46,.03)" };
const btnPrimary = { background: C.grape, color: "#fff", border: "none", borderRadius: 16,
  padding: "15px", fontSize: 14.5, fontWeight: 800, cursor: "pointer",
  boxShadow: "0 10px 24px rgba(108,92,231,.28)" };
const btnLight = { background: "rgba(255,255,255,.22)", color: "#fff", border: "none",
  borderRadius: 12, padding: "9px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" };
const btnGhost = { background: C.bg, color: C.sub, border: `1px solid ${C.line}`,
  borderRadius: 12, padding: "8px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" };

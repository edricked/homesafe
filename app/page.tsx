"use client";

import { useEffect, useMemo, useState } from "react";

type IncidentKey = "fire" | "water" | "outage" | "evacuation";
type Screen = "home" | "choose" | "guide" | "message" | "plan";

const incidents: Record<
  IncidentKey,
  { label: string; eyebrow: string; tone: string; steps: string[] }
> = {
  fire: {
    label: "Fire or smoke",
    eyebrow: "Leave immediately",
    tone: "red",
    steps: [
      "Get everyone outside. Do not stop to collect belongings.",
      "Use stairs, not lifts. Stay low if there is smoke.",
      "Go to your outdoor meeting point.",
      "Call your local emergency number from a safe place.",
      "Do not go back inside until authorities say it is safe.",
    ],
  },
  water: {
    label: "Water leak",
    eyebrow: "Stop the source safely",
    tone: "blue",
    steps: [
      "Keep away from water near electrical outlets or appliances.",
      "If safe, close the main water shutoff.",
      "Move people and pets away from the affected area.",
      "Call building management or an emergency plumber.",
      "Photograph damage only when the area is safe.",
    ],
  },
  outage: {
    label: "Power outage",
    eyebrow: "Check everyone first",
    tone: "gold",
    steps: [
      "Check whether anyone relies on powered medical equipment.",
      "Use a torch. Avoid candles and open flames.",
      "Unplug sensitive electronics and keep the fridge closed.",
      "Check the official utility channel when a connection is available.",
      "Move to your backup location if safety or medical needs require it.",
    ],
  },
  evacuation: {
    label: "Evacuation",
    eyebrow: "Leave early and calmly",
    tone: "orange",
    steps: [
      "Follow official evacuation instructions immediately.",
      "Take people, essential medication, keys, phones, and pets.",
      "Use your planned route unless authorities direct otherwise.",
      "Go to your primary meeting point and check in.",
      "Do not return until authorities confirm it is safe.",
    ],
  },
};

const statusLabels = {
  safe: "I’m safe",
  help: "I need help",
  moving: "I’m relocating",
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [incident, setIncident] = useState<IncidentKey>("evacuation");
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<keyof typeof statusLabels>("safe");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationState, setLocationState] = useState<
    "idle" | "loading" | "denied" | "ready"
  >("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("homesafe-contact");
    if (saved) setPhone(saved);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  const begin = (key: IncidentKey) => {
    setIncident(key);
    setStep(0);
    setScreen("guide");
  };

  const timestamp = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    [screen, location]
  );

  const message = useMemo(() => {
    const detail =
      status === "help"
        ? "Please call me. If you cannot reach me, contact emergency services."
        : status === "moving"
          ? "I’m leaving now and heading to our meeting point."
          : "No immediate help is needed.";
    const position = location
      ? ` My location: https://maps.google.com/?q=${location.latitude},${location.longitude} (accuracy about ${Math.round(location.accuracy)}m).`
      : "";
    return `HOMESAFE: ${statusLabels[status]}. ${detail}${position} Updated ${timestamp}.`;
  }, [location, status, timestamp]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("denied");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
          accuracy: coords.accuracy,
        });
        setLocationState("ready");
      },
      () => setLocationState("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const openSms = () => {
    if (phone) window.localStorage.setItem("homesafe-contact", phone);
    const recipient = phone.replace(/[^\d+]/g, "");
    window.location.href = `sms:${recipient}?body=${encodeURIComponent(message)}`;
  };

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className={`app incident-${incidents[incident].tone}`}>
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("home")} aria-label="HomeSafe home">
          <span className="brand-mark">H</span>
          <span>HomeSafe</span>
        </button>
        <span className="offline-pill"><i /> Ready offline</span>
      </header>

      {screen === "home" && (
        <section className="home-screen">
          <div className="calm-copy">
            <p className="kicker">Your household emergency plan</p>
            <h1>Know the next safe step.</h1>
            <p className="lede">
              Clear guidance, essential details, and a prepared check-in—even when
              the internet is unreliable.
            </p>
          </div>

          <button className="emergency-button" onClick={() => setScreen("choose")}>
            <span className="pulse-ring" />
            <strong>Emergency mode</strong>
            <small>Tap to choose what’s happening</small>
          </button>

          <div className="quick-grid">
            <button onClick={() => setScreen("message")}>
              <span className="quick-icon">↗</span>
              <b>Send a check-in</b>
              <small>Prepare SMS</small>
            </button>
            <button onClick={() => setScreen("plan")}>
              <span className="quick-icon">⌂</span>
              <b>Household plan</b>
              <small>Contacts & meeting point</small>
            </button>
          </div>

          <div className="readiness">
            <div>
              <span className="readiness-score">72%</span>
              <span><b>Plan readiness</b><small>3 details still need attention</small></span>
            </div>
            <span className="arrow">→</span>
          </div>
        </section>
      )}

      {screen === "choose" && (
        <section className="sheet">
          <button className="back" onClick={() => setScreen("home")}>← Back</button>
          <p className="kicker">Emergency mode</p>
          <h2>What’s happening?</h2>
          <p className="muted">Choose the closest situation. If anyone is in immediate danger, call your local emergency number.</p>
          <div className="incident-list">
            {(Object.keys(incidents) as IncidentKey[]).map((key) => (
              <button key={key} onClick={() => begin(key)}>
                <span className={`incident-dot ${incidents[key].tone}`} />
                <span><b>{incidents[key].label}</b><small>{incidents[key].eyebrow}</small></span>
                <span>→</span>
              </button>
            ))}
          </div>
          <a className="call-button" href="tel:">
            <span>☎</span> Call emergency services
          </a>
        </section>
      )}

      {screen === "guide" && (
        <section className="guide-screen">
          <div className="guide-head">
            <button className="back light" onClick={() => setScreen("choose")}>← Change emergency</button>
            <p className="kicker">Step {step + 1} of {incidents[incident].steps.length}</p>
            <h2>{incidents[incident].label}</h2>
          </div>
          <div className="action-card">
            <span className="step-number">{step + 1}</span>
            <p>{incidents[incident].steps[step]}</p>
            <div className="progress">
              {incidents[incident].steps.map((_, i) => <i key={i} className={i <= step ? "active" : ""} />)}
            </div>
          </div>
          <div className="guide-actions">
            {step < incidents[incident].steps.length - 1 ? (
              <button className="primary" onClick={() => setStep(step + 1)}>Done — show next step</button>
            ) : (
              <button className="primary" onClick={() => setScreen("message")}>Check in with my contacts</button>
            )}
            {step > 0 && <button className="text-button" onClick={() => setStep(step - 1)}>Previous step</button>}
          </div>
          <p className="safety-note">HomeSafe supports your household plan. Always follow instructions from local authorities.</p>
        </section>
      )}

      {screen === "message" && (
        <section className="sheet message-sheet">
          <button className="back" onClick={() => setScreen("home")}>← Back</button>
          <p className="kicker">Prepared check-in</p>
          <h2>Tell someone your status.</h2>
          <div className="segmented">
            {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map((key) => (
              <button key={key} className={status === key ? "selected" : ""} onClick={() => setStatus(key)}>
                {statusLabels[key]}
              </button>
            ))}
          </div>
          <label className="field">
            <span>Emergency contact number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="+65 9123 4567" />
          </label>
          <div className="location-card">
            <div>
              <b>{location ? "Current location included" : "Include your current location?"}</b>
              <small>
                {location
                  ? `${location.latitude}, ${location.longitude} · ±${Math.round(location.accuracy)}m`
                  : locationState === "denied"
                    ? "Location unavailable. You can still send without it."
                    : "Requested once and not stored by default."}
              </small>
            </div>
            {!location && <button onClick={requestLocation} disabled={locationState === "loading"}>
              {locationState === "loading" ? "Locating…" : "Add location"}
            </button>}
          </div>
          <div className="message-preview">
            <span>Message preview</span>
            <p>{message}</p>
          </div>
          <button className="primary" onClick={openSms}>Open in Messages</button>
          <button className="secondary" onClick={copyMessage}>{copied ? "Copied" : "Copy message instead"}</button>
          <p className="safety-note">Your messaging app will open. Review the recipient and message, then tap Send.</p>
        </section>
      )}

      {screen === "plan" && (
        <section className="sheet">
          <button className="back" onClick={() => setScreen("home")}>← Back</button>
          <p className="kicker">Household plan</p>
          <h2>Your essentials, in one place.</h2>
          <div className="plan-card highlight">
            <span>Primary meeting point</span>
            <b>Front gate, across the road</b>
            <small>Stay together and do not re-enter the building.</small>
          </div>
          <div className="plan-list">
            <button><span>◎</span><b>People & pets</b><small>3 people · 1 pet</small><i>→</i></button>
            <button><span>☎</span><b>Emergency contacts</b><small>2 contacts saved</small><i>→</i></button>
            <button><span>⌁</span><b>Utility shutoffs</b><small>Water and electricity</small><i>→</i></button>
            <button><span>✚</span><b>Medication & access needs</b><small>Review details</small><i>→</i></button>
          </div>
          <div className="offline-banner"><i /> Emergency plan available offline on this device</div>
        </section>
      )}
    </main>
  );
}

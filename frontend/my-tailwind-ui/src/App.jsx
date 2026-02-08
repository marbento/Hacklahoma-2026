// frontend/my-tailwind-ui/src/App.jsx
import { useRef, useState } from "react";
// Import your SVG assets here
import b1c1DataRaw from "./assets/b1c1?raw";
import b1c1Sheet from "./assets/b1c1sheet.png";
import b1c2DataRaw from "./assets/b1c2?raw";
import b1c2Sheet from "./assets/b1c2sheet.png";
import b2c1DataRaw from "./assets/b2c1.json?raw";
import b2c1Sheet from "./assets/b2c1sheet .png";
import b2c2DataRaw from "./assets/b2c2.json?raw";
import b2c2Sheet from "./assets/b2c2sheet.png";
import backgroundImage from "./assets/background.png";
import body1Svg from "./assets/body1.svg";
import body2Svg from "./assets/body2.svg";
import clothing1Svg from "./assets/cloth1.svg";
import clothing2Svg from "./assets/cloth2.svg";
import detourImage from "./assets/detour.png";
import hair1Svg from "./assets/hair1.svg";
import hair2Svg from "./assets/hair2.svg";
import trail1Image from "./assets/trail1.png";
import trail2Image from "./assets/trail2.png";

const b1c1Data = JSON.parse(b1c1DataRaw);
const b1c2Data = JSON.parse(b1c2DataRaw);
const b2c1Data = JSON.parse(b2c1DataRaw);
const b2c2Data = JSON.parse(b2c2DataRaw);

const getSpriteConfig = (data, sheet, targetSize) => {
  const frameSize = data.meta.size.h;
  const sheetWidth = data.meta.size.w;
  const scale = targetSize / frameSize;
  const shift = (sheetWidth - frameSize) * scale;
  const frameCount = Math.max(1, Math.round(sheetWidth / frameSize));
  const steps = Math.min(5, frameCount);
  return {
    sheet,
    frameSize,
    sheetWidth,
    scale,
    shift,
    steps,
  };
};

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedHair, setSelectedHair] = useState(0);
  const [selectedBody, setSelectedBody] = useState(0);
  const [selectedClothing, setSelectedClothing] = useState(0);
  const [reportRange, setReportRange] = useState("week");
  const [integrationTab, setIntegrationTab] = useState("push");
  const [savedAvatar, setSavedAvatar] = useState({
    body: 0,
    hair: 0,
    clothing: 0,
  });
  const [timeCardExpanded, setTimeCardExpanded] = useState(false);

  const handleSaveAvatar = () => {
    setSavedAvatar({
      body: selectedBody,
      hair: selectedHair,
      clothing: selectedClothing,
    });
    // Switch to home tab to see the saved avatar
    setActiveTab("home");
  };

  // Time tracking (productive vs. distracting time)
  const investedMinutes = 220; // Time spent on productive apps
  const lostMinutes = 221; // Time spent on distracting apps
  const totalMinutes = investedMinutes + lostMinutes;
  const investedPct = Math.round((investedMinutes / totalMinutes) * 100);
  const lostPct = Math.round((lostMinutes / totalMinutes) * 100);
  const netMinutes = investedMinutes - lostMinutes; // Positive = time saved, negative = time lost
  const balanceScore = Math.round(
    ((investedMinutes - lostMinutes) / totalMinutes) * 100,
  );
  const trendScore = Math.min(100, Math.max(0, 50 + balanceScore));

  // Game progression state
  const [baseStepsNeeded] = useState(() => Math.floor(Math.random() * 11) + 30);
  const tasksCompleted = 3; // Number of tasks finished today
  const completedTasks = [
    { title: "Submit studio reflection", source: "Canvas", steps: 3 },
    { title: "Design review scheduled", source: "Google Calendar", steps: 2 },
    { title: "Outline v2 delivered", source: "Notion", steps: 4 },
    { title: "Prototype handoff sent", source: "Microsoft 365", steps: 3 },
    { title: "Research notes tagged", source: "Notion", steps: 2 },
  ];
  const completedTaskSteps = completedTasks.reduce(
    (sum, task) => sum + task.steps,
    0,
  );
  const pushApps = [
    {
      name: "Notion",
      detail: "Tasks",
      badge: "N",
      color: "bg-[#e8e0d1] text-[#6f6a5c]",
      connected: true,
    },
    {
      name: "Google Calendar",
      detail: "Events",
      badge: "G",
      color: "bg-[#dfe6cf] text-[#6f7758]",
      connected: true,
    },
    {
      name: "Microsoft 365",
      detail: "Tasks",
      badge: "M",
      color: "bg-[#d9e1cf] text-[#6f7758]",
      connected: false,
    },
  ];
  const stayOffApps = [
    {
      name: "Instagram",
      detail: "Usage signals",
      badge: "I",
      color: "bg-[#ecd9c8] text-[#b07d5b]",
      connected: false,
    },
    {
      name: "YouTube",
      detail: "Watch time",
      badge: "Y",
      color: "bg-[#f1d7c5] text-[#b07d5b]",
      connected: false,
    },
    {
      name: "Reddit",
      detail: "Scroll loops",
      badge: "R",
      color: "bg-[#e8e0d1] text-[#6f6a5c]",
      connected: false,
    },
  ];
  const initialSteps = 30; // Test banked steps
  const hasDetour = netMinutes < 0;
  const detourNodes = [
    { x: 280, y: 350 },
    { x: 210, y: 350 },
    { x: 160, y: 350 },
    { x: 80, y: 350 },
    { x: 20, y: 350 },
  ];
  const trailNodes = [
    { x: 140, y: 430 },
    { x: 80, y: 390 },
    { x: 110, y: 350 },
    { x: 160, y: 350 },
    { x: 150, y: 290 },
    { x: 80, y: 280 },
    { x: 45, y: 214 },
    { x: 150, y: 194 },
    { x: 210, y: 144 },
    { x: 145, y: 90 },
    { x: 95, y: 144 },
    { x: 100, y: 76 },
    { x: 70, y: 76 },
    { x: 30, y: 35 },
  ];
  const trailNodesTwo = trailNodes.map((node, index) => {
    if (index === 0) {
      return { ...node, y: node.y - 20 };
    }
    if (index === 1) {
      return { ...node, x: node.x - 20, y: node.y - 15 };
    }
    if (index === 2) {
      return { ...node, x: 115, y: 375 };
    }
    if (index === 3) {
      return { ...node, x: 165, y: 380 };
    }
    if (index === 4) {
      return { ...node, y: node.y + 35 };
    }
    if (index === 5) {
      return { ...node, x: node.x - 10, y: node.y + 45 };
    }
    if (index === 6) {
      return { ...node, y: node.y + 45 };
    }
    if (index === 7) {
      return { ...node, y: node.y + 65 };
    }
    if (index === 8) {
      return { ...node, y: node.y + 115 };
    }
    if (index === 9) {
      return { ...node, x: node.x + 60, y: node.y + 100 };
    }
    if (index === 10) {
      return { ...node, x: node.x + 40, y: node.y + 55 };
    }
    if (index === 11) {
      return { ...node, x: node.x + 40, y: node.y + 85 };
    }
    if (index === 12) {
      return { ...node, x: node.x + 60, y: node.y + 50 };
    }
    if (index === 13) {
      return { ...node, x: node.x + 60, y: node.y + 60 };
    }
    return { ...node };
  });
  const trails = [
    ...(hasDetour
      ? [{ name: "Detour", background: detourImage, nodes: detourNodes }]
      : []),
    { name: "Trail 1", background: trail1Image, nodes: trailNodes },
    { name: "Trail 2", background: trail2Image, nodes: trailNodesTwo },
  ];
  const [currentTrail, setCurrentTrail] = useState(0);
  const currentTrailData = trails[currentTrail];
  const currentNodes = currentTrailData.nodes;
  const maxTile = currentNodes.length - 1;
  const [bankedSteps, setBankedSteps] = useState(initialSteps);
  const [currentTile, setCurrentTile] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [showFinaleModal, setShowFinaleModal] = useState(false);
  const moveTimerRef = useRef(null);
  const itemsCollected = 2; // App integrations (each app connected = 1 item that helps your journey)
  const fogRevealDistance = 5; // How many tiles ahead are visible
  const trailProgressPct = Math.round(
    (currentTile / Math.max(1, maxTile)) * 100,
  ); // Progress percentage on the trail
  const lostSteps = Math.max(0, Math.round(lostMinutes / 30));
  const totalStepsNeeded = trails.reduce(
    (sum, trail) => sum + trail.nodes.length,
    0,
  );
  const [progressSteps, setProgressSteps] = useState(0);
  const stepsInvested = progressSteps;
  const dashboardProgressRaw = Math.round(
    (stepsInvested / totalStepsNeeded) * 100,
  );
  const dashboardProgressClamped = Math.max(
    0,
    Math.min(100, dashboardProgressRaw),
  );

  const reportRanges = {
    today: { label: "Today", steps: 4820, minutes: 47 },
    week: { label: "This Week", steps: 18420, minutes: 312 },
    month: { label: "This Month", steps: 61200, minutes: 1280 },
  };
  const reportSummary = reportRanges[reportRange] ?? reportRanges.week;
  const weeklyTrailData = [
    { day: "Mon", trail: 42, drift: 18 },
    { day: "Tue", trail: 30, drift: 26 },
    { day: "Wed", trail: 50, drift: 12 },
    { day: "Thu", trail: 38, drift: 20 },
    { day: "Fri", trail: 28, drift: 30 },
    { day: "Sat", trail: 22, drift: 36 },
    { day: "Sun", trail: 34, drift: 16 },
  ];
  const weeklyMax = Math.max(
    ...weeklyTrailData.map((item) => item.trail + item.drift),
    1,
  );
  const driftTriggers = [
    { name: "YouTube", minutes: 45 },
    { name: "Instagram", minutes: 25 },
    { name: "Reddit", minutes: 35 },
    { name: "Twitter", minutes: 20 },
  ];
  const driftMax = Math.max(...driftTriggers.map((item) => item.minutes), 1);

  // Avatar scores for Past, Present, Future
  const pastScore = 45; // Holistic all-time average (will be calculated from historical data)
  const presentScore = trendScore; // Current week's score
  const futureScore = Math.min(
    100,
    Math.max(0, presentScore + (presentScore - pastScore)),
  ); // Projected trajectory

  // Map score to avatar assets (0-1 index for now, can expand to more variants)
  const getAvatarFromScore = (score) => {
    // For now: score < 50 = variant 0, score >= 50 = variant 1
    // Later you can add more variants: 0-30 = struggling, 31-60 = neutral, 61-100 = thriving
    if (score < 50) {
      return { body: 0, hair: 0, clothing: 0 }; // "Struggling" look
    } else {
      return { body: 1, hair: 1, clothing: 1 }; // "Thriving" look
    }
  };

  const pastAvatar = getAvatarFromScore(pastScore);
  const presentAvatar = getAvatarFromScore(presentScore);
  const futureAvatar = getAvatarFromScore(futureScore);

  const summaryTone =
    balanceScore >= 25 ? "winning" : balanceScore <= -15 ? "messy" : "wobbly";
  const summaryCopy = {
    winning: {
      line1: "You stacked deep-focus sessions and dodged the autoplay traps.",
      line2:
        "Future you is booking a victory lap (and actually paying for it).",
    },
    wobbly: {
      line1:
        "You hit a few strong focus blocks, but the scroll loops fought back.",
      line2: "Future you is ok, but still counting couch-cushion coins.",
    },
    messy: {
      line1: "Autoplay ran the show and your focus windows got bulldozed.",
      line2:
        "Future you is negotiating with the fridge about what counts as dinner.",
    },
  }[summaryTone];
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = String(minutes % 60).padStart(2, "0");
    return `${hours}h ${mins}m`;
  };

  const moveDurationMs = 520;
  const spriteConfigB1C1 = getSpriteConfig(b1c1Data, b1c1Sheet, 44);
  const spriteConfigB1C2 = getSpriteConfig(b1c2Data, b1c2Sheet, 44);
  const spriteConfigB2C1 = getSpriteConfig(b2c1Data, b2c1Sheet, 44);
  const spriteConfigB2C2 = getSpriteConfig(b2c2Data, b2c2Sheet, 44);
  const activeSprite = isMoving
    ? savedAvatar.body === 0
      ? savedAvatar.clothing === 0
        ? spriteConfigB1C1
        : savedAvatar.clothing === 1
          ? spriteConfigB1C2
          : null
      : savedAvatar.body === 1
        ? savedAvatar.clothing === 0
          ? spriteConfigB2C1
          : savedAvatar.clothing === 1
            ? spriteConfigB2C2
            : null
        : null
    : null;
  const avatarPos = currentNodes[currentTile] ?? currentNodes[0];
  const isFinale =
    currentTrail === trails.length - 1 && currentTile === maxTile;
  const confettiPieces = [
    { left: "8%", delay: "0s", duration: "2.2s" },
    { left: "18%", delay: "0.3s", duration: "2.6s" },
    { left: "30%", delay: "0.6s", duration: "2.4s" },
    { left: "42%", delay: "0.2s", duration: "2.8s" },
    { left: "54%", delay: "0.5s", duration: "2.1s" },
    { left: "66%", delay: "0.1s", duration: "2.7s" },
    { left: "78%", delay: "0.4s", duration: "2.3s" },
    { left: "90%", delay: "0.7s", duration: "2.5s" },
  ];

  const canTakeStep = bankedSteps > 0;
  const handleTakeStep = () => {
    if (!canTakeStep) return;
    setBankedSteps((prev) => Math.max(0, prev - 1));
    setIsMoving(true);
    if (moveTimerRef.current) {
      clearTimeout(moveTimerRef.current);
    }
    moveTimerRef.current = setTimeout(() => {
      setIsMoving(false);
    }, moveDurationMs);
    if (currentTile >= maxTile && currentTrail < trails.length - 1) {
      setCurrentTrail((prev) => Math.min(trails.length - 1, prev + 1));
      setCurrentTile(0);
    } else {
      setCurrentTile((prev) => Math.min(maxTile, prev + 1));
    }
    setProgressSteps((prev) => Math.min(totalStepsNeeded, prev + 1));
  };

  return (
    <>
      <div className="relative min-h-screen bg-[#f3efe4] text-[#2c2a23] font-editorial app-text">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 right-10 h-80 w-80 rounded-full bg-[#d7b67a]/30 blur-3xl" />
          <div className="absolute bottom-[-80px] left-[-40px] h-96 w-96 rounded-full bg-[#9bbd9b]/35 blur-3xl" />
          <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#5e5a4a1a_1px,transparent_1px)] [background-size:18px_18px]" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="relative rounded-[48px] bg-gradient-to-br from-white/90 via-white/70 to-white/40 p-[2px] shadow-[0_30px_90px_rgba(79,70,51,0.35)]">
            <div
              className="relative h-[680px] w-[330px] overflow-hidden rounded-[46px] bg-gradient-to-b from-[#fdfaf2] via-[#f6f1e6] to-[#ece4d2]"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute left-1/2 top-3 h-6 w-32 -translate-x-1/2 rounded-full border border-[#cfc7b8] bg-[#f7f2e6]" />

              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between px-5 pt-5 text-xs text-[#6f6a5c]">
                  <span className="font-stamp text-[10px]">10:42</span>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6f7758]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6f7758]/70" />
                    <div className="flex h-3 w-6 items-center justify-start rounded-full border border-[#cfc7b8] px-0.5">
                      <div className="h-2 w-3 rounded-full bg-[#3b3528]/70" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6">
                  {activeTab === "home" && (
                    <>
                      {/* Header with stats */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#7c7666]">
                            Your Journey
                          </p>
                          <h1 className="mt-2 text-3xl font-semibold italic text-[#3b3528] font-display">
                            The Trail
                          </h1>
                          <button
                            type="button"
                            onClick={handleTakeStep}
                            disabled={!canTakeStep}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#d8d0c2] bg-[#fbf8ef]/70 px-3 py-1.5 text-[11px] font-medium shadow-sm transition-all hover:bg-[#fbf8ef]/85 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <span>Take a Step</span>
                            <span className="text-[12px]">👣</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1 rounded-xl bg-[#fbf8ef] px-2 py-1 shadow-md">
                          <span className="text-lg">👣</span>
                          <span className="text-xs font-bold text-[#3b3528]">
                            {bankedSteps}
                          </span>
                        </div>
                      </div>

                      {/* Trail View */}
                      <div
                        className="relative mt-6 h-[450px] overflow-hidden rounded-3xl border border-[#d8d0c2] bg-[#eef0f2] p-4 shadow-[0_16px_30px_rgba(79,70,51,0.18)]"
                        style={{
                          backgroundImage: `url(${currentTrailData.background})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        {/* Trail tiles - winding path from bottom to top */}
                        <div className="relative h-full">
                          {/* Generate 20 tiles in a winding pattern */}
                          {Array.from(
                            { length: currentNodes.length },
                            (_, i) => {
                              const tileIndex = maxTile - i; // Reverse so tile 0 is at bottom
                              const isCurrentTile = tileIndex === currentTile;
                              const isPastTile = tileIndex < currentTile;
                              const isFoggy =
                                tileIndex > currentTile + fogRevealDistance;
                              const pos = currentNodes[tileIndex];

                              return (
                                <div
                                  key={tileIndex}
                                  className="absolute transition-all duration-300"
                                  style={{
                                    left: `${pos.x}px`,
                                    top: `${pos.y}px`,
                                    opacity: isFoggy ? 0.15 : 1,
                                    filter: isFoggy ? "blur(4px)" : "none",
                                  }}
                                >
                                  {/* Tile */}
                                  <div
                                    className={`h-8 w-8 rounded-lg border-2 transition-all ${
                                      isPastTile
                                        ? "border-[#8f9974] bg-[#dfe6cf]"
                                        : isCurrentTile
                                          ? "border-[#a7b48a] bg-[#e8edd8] shadow-lg"
                                          : "border-[#cfc7b8] bg-[#fdf9f0]"
                                    }`}
                                    style={{ imageRendering: "pixelated" }}
                                  />

                                  {isCurrentTile && null}
                                </div>
                              );
                            },
                          )}
                        </div>

                        <div
                          className={`absolute ${isFinale ? "cursor-pointer" : "pointer-events-none"}`}
                          style={{
                            left: `${avatarPos.x + 16}px`,
                            top: `${avatarPos.y - 48}px`,
                            transform: "translateX(-50%)",
                            transition: `left ${moveDurationMs}ms steps(5), top ${moveDurationMs}ms steps(5)`,
                            willChange: "left, top",
                          }}
                          onClick={() => {
                            if (!isFinale) return;
                            setShowFinaleModal(true);
                          }}
                        >
                          <div
                            className={`relative ${isFinale ? "finale-glow" : ""}`}
                            style={{ width: "44px", height: "44px" }}
                          >
                            {activeSprite ? (
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: `url(${activeSprite.sheet})`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundSize: `${activeSprite.sheetWidth * activeSprite.scale}px ${activeSprite.frameSize * activeSprite.scale}px`,
                                  width: "44px",
                                  height: "44px",
                                  animation: `sprite-step ${moveDurationMs}ms steps(${activeSprite.steps}) infinite`,
                                  ["--sprite-shift"]: `-${activeSprite.shift}px`,
                                }}
                              />
                            ) : (
                              <>
                                {savedAvatar.body === 0 ? (
                                  <img
                                    src={body1Svg}
                                    alt="Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={body2Svg}
                                    alt="Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                                {savedAvatar.clothing === 0 ? (
                                  <img
                                    src={clothing1Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={clothing2Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                              </>
                            )}
                            {savedAvatar.hair === 0 ? (
                              <img
                                src={hair1Svg}
                                alt="Hair"
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            ) : (
                              <img
                                src={hair2Svg}
                                alt="Hair"
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Fog overlay gradient - obscures top of trail */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent" />

                        {isFinale && (
                          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
                            {confettiPieces.map((piece, index) => (
                              <span
                                key={index}
                                className="confetti-piece"
                                style={{
                                  left: piece.left,
                                  animationDelay: piece.delay,
                                  animationDuration: piece.duration,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Trail Progress Summary */}
                      <div className="mt-4 rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-3 shadow-[0_14px_26px_rgba(79,70,51,0.18)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">
                          Progress
                        </p>
                        <div className="mt-2 flex items-center justify-between text-sm text-[#3b3528]">
                          <span className="font-semibold">
                            {stepsInvested}/{totalStepsNeeded} steps
                          </span>
                          <span className="font-semibold">
                            {dashboardProgressClamped}% completed
                          </span>
                        </div>
                      </div>

                      {/* Time Saved / Time Lost */}
                      <div
                        className="mt-4 cursor-pointer rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-4 shadow-[0_14px_26px_rgba(79,70,51,0.18)] transition-all hover:shadow-[0_18px_34px_rgba(79,70,51,0.2)]"
                        onClick={() => setTimeCardExpanded((prev) => !prev)}
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-[#7c7666]">
                          {netMinutes >= 0 ? "Time Saved" : "Time Lost"}
                        </p>
                        <p
                          className={`mt-2 text-3xl font-bold ${netMinutes >= 0 ? "text-[#6f7758]" : "text-[#b07d5b]"}`}
                        >
                          {netMinutes >= 0 ? "+" : "-"}
                          {formatMinutes(Math.abs(netMinutes))}
                        </p>
                        {timeCardExpanded && (
                          <div className="mt-3 space-y-2 border-t border-[#e8e0d1] pt-3">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-[#6f6a5c]">
                                Productive time
                              </p>
                              <p className="text-sm font-bold text-[#6f7758]">
                                +{formatMinutes(investedMinutes)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-[#6f6a5c]">
                                Unproductive time
                              </p>
                              <p className="text-sm font-bold text-[#b07d5b]">
                                -{formatMinutes(lostMinutes)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#e8e0d1] pt-2">
                              <p className="text-sm font-semibold text-[#3b3528]">
                                Net result
                              </p>
                              <p
                                className={`text-sm font-bold ${netMinutes >= 0 ? "text-[#6f7758]" : "text-[#b07d5b]"}`}
                              >
                                {netMinutes >= 0 ? "+" : "-"}
                                {formatMinutes(Math.abs(netMinutes))}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recent App Activities */}
                      <div className="mt-6">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">
                          Recent Activities
                        </h3>
                        <div className="mt-3 space-y-2">
                          <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">
                                  Deep Focus
                                </p>
                                <p className="text-xs text-[#6f6a5c]">
                                  2h in Canvas
                                </p>
                              </div>
                              <span className="rounded-full bg-[#dfe6cf] px-2 py-1 text-xs text-[#6f7758]">
                                +2 👣
                              </span>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">
                                  Project Work
                                </p>
                                <p className="text-xs text-[#6f6a5c]">
                                  1h 30m in Notion
                                </p>
                              </div>
                              <span className="rounded-full bg-[#dfe6cf] px-2 py-1 text-xs text-[#6f7758]">
                                +1 👣
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Old code kept below for reference - will delete once trail is finalized */}
                      <details
                        className="group mt-6 rounded-3xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-4 shadow-[0_16px_30px_rgba(79,70,51,0.18)]"
                        style={{ display: "none" }}
                      >
                        <summary className="cursor-pointer list-none">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-[#7c7666]">
                                Past Week Summary
                              </p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8e0d1] text-[#6f6a5c]">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-current transition-transform duration-300 group-open:rotate-180"
                              >
                                <path
                                  d="M8 10L12 14L16 10"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-3">
                            {/* Past Avatar */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                              <div
                                className="relative"
                                style={{ width: "64px", height: "64px" }}
                              >
                                {savedAvatar.body === 0 ? (
                                  <img
                                    src={body1Svg}
                                    alt="Past Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={body2Svg}
                                    alt="Past Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                                {/* Clothing Layer */}
                                {savedAvatar.clothing === 0 ? (
                                  <img
                                    src={clothing1Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={clothing2Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                                {/* Hair Layer */}
                                {savedAvatar.hair === 0 ? (
                                  <img
                                    src={hair1Svg}
                                    alt="Hair"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={hair2Svg}
                                    alt="Hair"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                              </div>
                              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7c7666]">
                                Past
                              </p>
                            </div>

                            {/* Now Avatar */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                              <div
                                className="relative"
                                style={{ width: "64px", height: "64px" }}
                              >
                                {savedAvatar.body === 0 ? (
                                  <img
                                    src={body1Svg}
                                    alt="Now Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={body2Svg}
                                    alt="Now Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                                {/* Clothing Layer */}
                                {savedAvatar.clothing === 0 ? (
                                  <img
                                    src={clothing1Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={clothing2Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                                {/* Hair Layer */}
                                {savedAvatar.hair === 0 ? (
                                  <img
                                    src={hair1Svg}
                                    alt="Hair"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={hair2Svg}
                                    alt="Hair"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                              </div>
                              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7c7666]">
                                Present
                              </p>
                            </div>

                            {/* Future Avatar */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                              <div
                                className="relative"
                                style={{ width: "64px", height: "64px" }}
                              >
                                {savedAvatar.body === 0 ? (
                                  <img
                                    src={body1Svg}
                                    alt="Future Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={body2Svg}
                                    alt="Future Avatar"
                                    className="absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                                {/* Clothing Layer */}
                                {savedAvatar.clothing === 0 ? (
                                  <img
                                    src={clothing1Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={clothing2Svg}
                                    alt="Clothing"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                                {/* Hair Layer */}
                                {savedAvatar.hair === 0 ? (
                                  <img
                                    src={hair1Svg}
                                    alt="Hair"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                ) : (
                                  <img
                                    src={hair2Svg}
                                    alt="Hair"
                                    className="pointer-events-none absolute inset-0 h-full w-full"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                )}
                              </div>
                              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7c7666]">
                                Future
                              </p>
                            </div>
                          </div>
                        </summary>

                        <div className="mt-4 space-y-2 text-sm text-[#6f6a5c]">
                          <p>{summaryCopy.line1}</p>
                          <p>{summaryCopy.line2}</p>
                        </div>
                      </details>
                    </>
                  )}

                  {activeTab === "goals" && (
                    <div className="space-y-6 rounded-3xl bg-[#fbf8ef]/75 p-4 text-[#3b3528] shadow-[0_18px_40px_rgba(79,70,51,0.18)]">
                      {/* Gear Section */}
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7c7666]">
                            Gear
                          </p>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c8576]">
                            Loadout
                          </span>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {[
                            {
                              name: "Telescope",
                              icon: "🔭",
                              status: "selected",
                              helper: "Connected",
                              locked: false,
                            },
                            {
                              name: "Flashlight",
                              icon: "🔦",
                              status: "unlocked",
                              helper: "Connected",
                              locked: false,
                            },
                            {
                              name: "Sleeping Bag",
                              icon: "🛏️",
                              status: "locked",
                              helper: "Connect Canvas",
                              locked: true,
                            },
                            {
                              name: "Compass",
                              icon: "🧭",
                              status: "locked",
                              helper: "Connect Instagram",
                              locked: true,
                            },
                            {
                              name: "Lantern",
                              icon: "🏮",
                              status: "locked",
                              helper: "Connect Microsoft 365",
                              locked: true,
                            },
                          ].map((item) => {
                            const isSelected = item.status === "selected";
                            const isLocked = item.locked;
                            return (
                              <div
                                key={item.name}
                                className={`relative flex flex-col items-center justify-between rounded-2xl border p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)] transition ${
                                  isSelected
                                    ? "border-[#3b3528] bg-[#efe5d6]/75 ring-1 ring-[#3b3528]/30"
                                    : "border-[#d8d0c2] bg-[#fbf8ef]/75"
                                } ${isLocked ? "opacity-45" : "opacity-100"}`}
                              >
                                {isSelected && (
                                  <span className="absolute right-2 top-2 text-xs text-[#6f7758]">
                                    ✓
                                  </span>
                                )}
                                {isLocked && (
                                  <span className="absolute right-2 top-2 text-xs text-[#7c7666]">
                                    🔒
                                  </span>
                                )}
                                <span
                                  className={`text-3xl ${isLocked ? "grayscale" : ""}`}
                                >
                                  {item.icon}
                                </span>
                                <div className="mt-2">
                                  <p
                                    className={`text-[11px] font-semibold ${isLocked ? "text-[#7c7666]" : "text-[#3b3528]"}`}
                                  >
                                    {item.name}
                                  </p>
                                  <p
                                    className={`mt-1 text-[9px] ${isLocked ? "text-[#8c8576]" : "text-[#6f7758]"}`}
                                  >
                                    {item.helper}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Integrations Section */}
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7c7666]">
                            {integrationTab === "push"
                              ? "Pull Apps"
                              : "Push Apps"}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[12px] transition ${
                                integrationTab === "push"
                                  ? "border-[#3b3528] bg-[#3b3528] text-[#fbf8ef]"
                                  : "border-[#d8d0c2] text-[#6f6a5c]"
                              }`}
                              onClick={() => setIntegrationTab("push")}
                              aria-label="Show push apps"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className={`flex h-7 w-7 items-center justify-center rounded-full border text-[12px] transition ${
                                integrationTab === "off"
                                  ? "border-[#3b3528] bg-[#3b3528] text-[#fbf8ef]"
                                  : "border-[#d8d0c2] text-[#6f6a5c]"
                              }`}
                              onClick={() => setIntegrationTab("off")}
                              aria-label="Show stay off apps"
                            >
                              ⦸
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-[10px] text-[#6f6a5c]">
                          {integrationTab === "push"
                            ? "Pull apps are apps you want. Push apps are apps you want to stay away from."
                            : "Pull apps are apps you want. Push apps are apps you want to stay away from."}
                        </p>
                        <div className="mt-4 space-y-3">
                          {(integrationTab === "push"
                            ? pushApps
                            : stayOffApps
                          ).map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center gap-3 rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 px-4 py-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]"
                            >
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} text-sm font-semibold`}
                              >
                                {item.badge}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-[#3b3528]">
                                  {item.name}
                                </p>
                                <p className="text-[10px] text-[#6f6a5c]">
                                  {item.detail}
                                </p>
                              </div>
                              {item.connected ? (
                                <span className="text-xs font-semibold text-[#6f7758]">
                                  ✓ Connected
                                </span>
                              ) : (
                                <button
                                  className="rounded-xl border-2 border-[#3b3528] bg-[#e6ddc8] px-3 py-1 text-[10px] font-semibold text-[#3b3528]"
                                  type="button"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "stats" && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[#7c7666]">
                          Completed Tasks
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold italic text-[#3b3528] font-display">
                          Integrated Task Feed
                        </h1>
                        <p className="mt-1 text-xs text-[#6f6a5c]">
                          Crossed-off work that banked steps
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-4 shadow-[0_14px_26px_rgba(79,70,51,0.18)]">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-[#7c7666]">
                          <span>Today</span>
                          <span>{completedTaskSteps} steps banked</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          {completedTasks.map((task) => (
                            <div
                              key={`${task.title}-${task.source}`}
                              className="flex items-center justify-between rounded-xl border border-[#e1d8ca] bg-[#fbf8ef]/60 px-3 py-2 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d8d0c2] bg-[#f5eee0]/80 text-[11px]">
                                  ✓
                                </span>
                                <div>
                                  <p className="text-sm font-medium line-through text-[#6f6a5c]">
                                    {task.title}
                                  </p>
                                  <p className="text-[10px] text-[#8c8576]">
                                    {task.source}
                                  </p>
                                </div>
                              </div>
                              <span className="rounded-full bg-[#dfe6cf] px-2 py-1 text-[10px] text-[#6f7758]">
                                +{task.steps} 👣
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "profile" && (
                    <div className="flex h-full flex-col">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[#7c7666]">
                          Profile
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold italic text-[#3b3528] font-display">
                          Avatar Maker
                        </h1>
                        <p className="mt-1 text-xs text-[#6f6a5c]">
                          Customize your pixel character
                        </p>
                      </div>

                      {/* Avatar Preview - Large Display */}
                      <div className="mt-4 flex-1 rounded-3xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-5 shadow-[0_14px_26px_rgba(79,70,51,0.18)]">
                        <p className="text-center text-xs uppercase tracking-[0.2em] text-[#7c7666]">
                          Your Avatar
                        </p>
                        <div className="flex h-full items-center justify-center p-4">
                          {/* 64x64 grid scaled up 3x = 192px for crisp pixels */}
                          <div
                            className="relative"
                            style={{
                              width: "192px",
                              height: "192px",
                              imageRendering: "pixelated",
                            }}
                          >
                            {/* Body Layer */}
                            {selectedBody === 0 ? (
                              <img
                                src={body1Svg}
                                alt="Body 1"
                                className="absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            ) : (
                              <img
                                src={body2Svg}
                                alt="Body 2"
                                className="absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            )}

                            {/* Clothing Layer - overlay on top of body in same 64x64 grid */}
                            {selectedClothing === 0 ? (
                              <img
                                src={clothing1Svg}
                                alt="Clothing 1"
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            ) : (
                              <img
                                src={clothing2Svg}
                                alt="Clothing 2"
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            )}

                            {/* Hair Layer - overlay on top of body in same 64x64 grid */}
                            {selectedHair === 0 ? (
                              <img
                                src={hair1Svg}
                                alt="Hair 1"
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            ) : (
                              <img
                                src={hair2Svg}
                                alt="Hair 2"
                                className="pointer-events-none absolute inset-0 h-full w-full"
                                style={{ imageRendering: "pixelated" }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customization Controls - Bottom */}
                      <div className="mt-4 space-y-2">
                        {/* Body Control */}
                        <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">
                              Body
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedBody((prev) =>
                                    prev === 0 ? 1 : 0,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                                type="button"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="stroke-current"
                                  strokeWidth="2.5"
                                  strokeLinecap="square"
                                >
                                  <path d="M15 18L9 12L15 6" />
                                </svg>
                              </button>
                              <span className="min-w-[60px] text-center text-xs font-semibold text-[#3b3528]">
                                Type {selectedBody + 1}
                              </span>
                              <button
                                onClick={() =>
                                  setSelectedBody((prev) =>
                                    prev === 0 ? 1 : 0,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                                type="button"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="stroke-current"
                                  strokeWidth="2.5"
                                  strokeLinecap="square"
                                >
                                  <path d="M9 18L15 12L9 6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Hair Control */}
                        <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">
                              Hair
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedHair((prev) =>
                                    prev === 0 ? 1 : 0,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                                type="button"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="stroke-current"
                                  strokeWidth="2.5"
                                  strokeLinecap="square"
                                >
                                  <path d="M15 18L9 12L15 6" />
                                </svg>
                              </button>
                              <span className="min-w-[60px] text-center text-xs font-semibold text-[#3b3528]">
                                Style {selectedHair + 1}
                              </span>
                              <button
                                onClick={() =>
                                  setSelectedHair((prev) =>
                                    prev === 0 ? 1 : 0,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                                type="button"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="stroke-current"
                                  strokeWidth="2.5"
                                  strokeLinecap="square"
                                >
                                  <path d="M9 18L15 12L9 6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Clothing Control */}
                        <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/75 p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">
                              Clothing
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedClothing((prev) =>
                                    prev === 0 ? 1 : 0,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                                type="button"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="stroke-current"
                                  strokeWidth="2.5"
                                  strokeLinecap="square"
                                >
                                  <path d="M15 18L9 12L15 6" />
                                </svg>
                              </button>
                              <span className="min-w-[60px] text-center text-xs font-semibold text-[#3b3528]">
                                Outfit {selectedClothing + 1}
                              </span>
                              <button
                                onClick={() =>
                                  setSelectedClothing((prev) =>
                                    prev === 0 ? 1 : 0,
                                  )
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                                type="button"
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="stroke-current"
                                  strokeWidth="2.5"
                                  strokeLinecap="square"
                                >
                                  <path d="M9 18L15 12L9 6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <button
                          onClick={handleSaveAvatar}
                          className="w-full rounded-lg border border-[#d8d0c2] bg-[#fbf8ef]/65 p-2.5 text-[11px] font-medium shadow-[0_8px_16px_rgba(79,70,51,0.12)] backdrop-blur-sm transition-all hover:border-[#cfc7b8] hover:bg-[#fbf8ef]/85 hover:shadow-[0_10px_20px_rgba(79,70,51,0.16)] active:translate-y-[1px]"
                          type="button"
                        >
                          Save Avatar
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 pb-6">
                  <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef]/55 p-1 shadow-[0_10px_18px_rgba(79,70,51,0.12)] backdrop-blur-sm">
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        className={`flex flex-col items-center gap-0.5 rounded-lg border p-1 shadow-sm transition-all ${
                          activeTab === "home"
                            ? "border-[#b9b1a4] bg-[#f5eee0]/80"
                            : "border-[#e1d8ca] bg-[#fbf8ef]/50"
                        }`}
                        onClick={() => setActiveTab("home")}
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="stroke-current"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                        >
                          <path d="M4 10L12 4L20 10" strokeWidth="2.5" />
                          <path d="M6 10V20H18V10" strokeWidth="2.5" />
                        </svg>
                        <span className="text-[9px] font-medium">Home</span>
                      </button>
                      <button
                        className={`flex flex-col items-center gap-0.5 rounded-lg border p-1 shadow-sm transition-all ${
                          activeTab === "goals"
                            ? "border-[#b9b1a4] bg-[#f5eee0]/80"
                            : "border-[#e1d8ca] bg-[#fbf8ef]/50"
                        }`}
                        onClick={() => setActiveTab("goals")}
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="stroke-current"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            strokeWidth="2.5"
                          />
                          <path d="M9 12h6M12 9v6" strokeWidth="2.5" />
                        </svg>
                        <span className="text-[9px] font-medium">Apps</span>
                      </button>
                      <button
                        className={`flex flex-col items-center gap-0.5 rounded-lg border p-1 shadow-sm transition-all ${
                          activeTab === "stats"
                            ? "border-[#b9b1a4] bg-[#f5eee0]/80"
                            : "border-[#e1d8ca] bg-[#fbf8ef]/50"
                        }`}
                        onClick={() => setActiveTab("stats")}
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="stroke-current"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                        >
                          <rect
                            x="3"
                            y="5"
                            width="18"
                            height="14"
                            rx="2"
                            strokeWidth="2.5"
                          />
                          <path d="M8 9h8M8 13h5" strokeWidth="2.5" />
                        </svg>
                        <span className="text-[9px] font-medium">Tasks</span>
                      </button>
                      <button
                        className={`flex flex-col items-center gap-0.5 rounded-lg border p-1 shadow-sm transition-all ${
                          activeTab === "profile"
                            ? "border-[#b9b1a4] bg-[#f5eee0]/80"
                            : "border-[#e1d8ca] bg-[#fbf8ef]/50"
                        }`}
                        onClick={() => setActiveTab("profile")}
                        type="button"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="stroke-current"
                          strokeLinecap="square"
                          strokeLinejoin="miter"
                        >
                          <path
                            d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
                            strokeWidth="2.5"
                          />
                          <path
                            d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20"
                            strokeWidth="2.5"
                          />
                        </svg>
                        <span className="text-[9px] font-medium">Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showFinaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-3xl border border-[#d8d0c2] bg-[#fbf8ef]/90 p-6 shadow-[0_18px_40px_rgba(79,70,51,0.2)] backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[#7c7666]">
              Trek Complete
            </p>
            <h2 className="mt-2 text-2xl font-semibold italic font-display text-[#3b3528]">
              Ready for a new trek?
            </h2>
            <p className="mt-2 text-sm text-[#6f6a5c]">
              You reached the summit. Want to reset and start again?
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl border border-[#d8d0c2] bg-[#fbf8ef]/70 px-3 py-2 text-sm font-medium shadow-sm"
                onClick={() => setShowFinaleModal(false)}
              >
                Not yet
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-[#cfc7b8] bg-[#f5eee0]/90 px-3 py-2 text-sm font-medium shadow-sm"
                onClick={() => {
                  setShowFinaleModal(false);
                  setCurrentTrail(0);
                  setCurrentTile(0);
                  setProgressSteps(0);
                }}
              >
                Start new trek
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;

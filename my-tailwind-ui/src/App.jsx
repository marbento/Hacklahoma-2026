import { useState } from 'react'
// Import your SVG assets here
import body1Svg from './assets/body1.svg'
import body2Svg from './assets/body2.svg'
import clothing1Svg from './assets/cloth1.svg'
import clothing2Svg from './assets/cloth2.svg'
import hair1Svg from './assets/hair1.svg'
import hair2Svg from './assets/hair2.svg'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedHair, setSelectedHair] = useState(0)
  const [selectedBody, setSelectedBody] = useState(0)
  const [selectedClothing, setSelectedClothing] = useState(0)
  const [reportRange, setReportRange] = useState('week')
  const [savedAvatar, setSavedAvatar] = useState({
    body: 0,
    hair: 0,
    clothing: 0
  })
  const [timeCardExpanded, setTimeCardExpanded] = useState(false)

  const handleSaveAvatar = () => {
    setSavedAvatar({
      body: selectedBody,
      hair: selectedHair,
      clothing: selectedClothing
    })
    // Switch to home tab to see the saved avatar
    setActiveTab('home')
  }

  // Time tracking (productive vs. distracting time)
  const investedMinutes = 220 // Time spent on productive apps
  const lostMinutes = 85 // Time spent on distracting apps
  const totalMinutes = investedMinutes + lostMinutes
  const investedPct = Math.round((investedMinutes / totalMinutes) * 100)
  const lostPct = Math.round((lostMinutes / totalMinutes) * 100)
  const netMinutes = investedMinutes - lostMinutes // Positive = time saved, negative = time lost
  const balanceScore = Math.round(((investedMinutes - lostMinutes) / totalMinutes) * 100)
  const trendScore = Math.min(100, Math.max(0, 50 + balanceScore))

  // Game progression state
  const [baseStepsNeeded] = useState(() => Math.floor(Math.random() * 11) + 30)
  const tasksCompleted = 3 // Number of tasks finished today
  const totalSteps = Math.round(investedMinutes / 60) + tasksCompleted // 1 step per hour + 1 per task (4 + 3 = 7 steps)
  const currentTile = Math.min(19, totalSteps) // Current position on trail (max 19 for 20 tiles)
  const itemsCollected = 2 // App integrations (each app connected = 1 item that helps your journey)
  const fogRevealDistance = 5 // How many tiles ahead are visible
  const trailProgressPct = Math.round((currentTile / 19) * 100) // Progress percentage on the trail
  const lostSteps = Math.max(0, Math.round(lostMinutes / 30))
  const totalStepsNeeded = baseStepsNeeded + lostSteps
  const stepsInvested = totalSteps
  const dashboardProgressRaw = Math.round((stepsInvested / totalStepsNeeded) * 100)
  const dashboardProgressClamped = Math.max(0, Math.min(100, dashboardProgressRaw))

  const reportRanges = {
    today: { label: 'Today', steps: 4820, minutes: 47 },
    week: { label: 'This Week', steps: 18420, minutes: 312 },
    month: { label: 'This Month', steps: 61200, minutes: 1280 },
  }
  const reportSummary = reportRanges[reportRange] ?? reportRanges.week
  const weeklyTrailData = [
    { day: 'Mon', trail: 42, drift: 18 },
    { day: 'Tue', trail: 30, drift: 26 },
    { day: 'Wed', trail: 50, drift: 12 },
    { day: 'Thu', trail: 38, drift: 20 },
    { day: 'Fri', trail: 28, drift: 30 },
    { day: 'Sat', trail: 22, drift: 36 },
    { day: 'Sun', trail: 34, drift: 16 },
  ]
  const weeklyMax = Math.max(...weeklyTrailData.map((item) => item.trail + item.drift), 1)
  const driftTriggers = [
    { name: 'YouTube', minutes: 45 },
    { name: 'Instagram', minutes: 25 },
    { name: 'Reddit', minutes: 35 },
    { name: 'Twitter', minutes: 20 },
  ]
  const driftMax = Math.max(...driftTriggers.map((item) => item.minutes), 1)

  // Avatar scores for Past, Present, Future
  const pastScore = 45 // Holistic all-time average (will be calculated from historical data)
  const presentScore = trendScore // Current week's score
  const futureScore = Math.min(100, Math.max(0, presentScore + (presentScore - pastScore))) // Projected trajectory

  // Map score to avatar assets (0-1 index for now, can expand to more variants)
  const getAvatarFromScore = (score) => {
    // For now: score < 50 = variant 0, score >= 50 = variant 1
    // Later you can add more variants: 0-30 = struggling, 31-60 = neutral, 61-100 = thriving
    if (score < 50) {
      return { body: 0, hair: 0, clothing: 0 } // "Struggling" look
    } else {
      return { body: 1, hair: 1, clothing: 1 } // "Thriving" look
    }
  }

  const pastAvatar = getAvatarFromScore(pastScore)
  const presentAvatar = getAvatarFromScore(presentScore)
  const futureAvatar = getAvatarFromScore(futureScore)

  const summaryTone =
    balanceScore >= 25
      ? 'winning'
      : balanceScore <= -15
        ? 'messy'
        : 'wobbly'
  const summaryCopy = {
    winning: {
      line1: 'You stacked deep-focus sessions and dodged the autoplay traps.',
      line2: 'Future you is booking a victory lap (and actually paying for it).',
    },
    wobbly: {
      line1: 'You hit a few strong focus blocks, but the scroll loops fought back.',
      line2: 'Future you is ok, but still counting couch-cushion coins.',
    },
    messy: {
      line1: 'Autoplay ran the show and your focus windows got bulldozed.',
      line2: 'Future you is negotiating with the fridge about what counts as dinner.',
    },
  }[summaryTone]
  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = String(minutes % 60).padStart(2, '0')
    return `${hours}h ${mins}m`
  }

  return (
    <div className="relative min-h-screen bg-[#f3efe4] text-[#2c2a23] font-editorial">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-10 h-80 w-80 rounded-full bg-[#d7b67a]/30 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-40px] h-96 w-96 rounded-full bg-[#9bbd9b]/35 blur-3xl" />
        <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#5e5a4a1a_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="relative rounded-[48px] bg-gradient-to-br from-white/90 via-white/70 to-white/40 p-[2px] shadow-[0_30px_90px_rgba(79,70,51,0.35)]">
          <div className="relative h-[680px] w-[330px] overflow-hidden rounded-[46px] bg-gradient-to-b from-[#fdfaf2] via-[#f6f1e6] to-[#ece4d2]">
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
                {activeTab === 'home' && (
                  <>
                    {/* Header with stats */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[#7c7666]">Your Journey</p>
                        <h1 className="mt-2 text-3xl font-semibold italic text-[#3b3528] font-display">The Trail</h1>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-[#fbf8ef] px-2 py-1 shadow-md">
                        <span className="text-lg">👣</span>
                        <span className="text-xs font-bold text-[#3b3528]">{totalSteps}</span>
                      </div>
                    </div>

                    {/* Trail View */}
                    <div className="relative mt-6 h-[450px] overflow-hidden rounded-3xl border border-[#d8d0c2] bg-gradient-to-b from-[#efe8d8] via-[#f4eddc] to-[#efe1c8] p-4 shadow-[0_16px_30px_rgba(79,70,51,0.18)]">
                      {/* Trail tiles - winding path from bottom to top */}
                      <div className="relative h-full">
                        {/* Generate 20 tiles in a winding pattern */}
                        {Array.from({ length: 20 }, (_, i) => {
                          const tileIndex = 19 - i // Reverse so tile 0 is at bottom
                          const isCurrentTile = tileIndex === currentTile
                          const isPastTile = tileIndex < currentTile
                          const isFoggy = tileIndex > currentTile + fogRevealDistance

                          // Winding pattern: alternate left/center/right
                          const positions = [
                            { x: 40, y: 420 },   // 0 - bottom left
                            { x: 120, y: 400 },  // 1
                            { x: 200, y: 380 },  // 2 - right
                            { x: 160, y: 360 },  // 3
                            { x: 80, y: 340 },   // 4 - left
                            { x: 140, y: 320 },  // 5 - center
                            { x: 200, y: 300 },  // 6 - right
                            { x: 120, y: 280 },  // 7
                            { x: 60, y: 260 },   // 8 - left
                            { x: 140, y: 240 },  // 9 - center
                            { x: 200, y: 220 },  // 10 - right
                            { x: 140, y: 200 },  // 11 - center
                            { x: 70, y: 180 },   // 12 - left
                            { x: 140, y: 160 },  // 13 - center
                            { x: 210, y: 140 },  // 14 - right
                            { x: 140, y: 120 },  // 15 - center
                            { x: 80, y: 100 },   // 16 - left
                            { x: 160, y: 80 },   // 17
                            { x: 120, y: 60 },   // 18
                            { x: 140, y: 40 },   // 19 - top
                          ]

                          const pos = positions[tileIndex]

                          return (
                            <div
                              key={tileIndex}
                              className="absolute transition-all duration-300"
                              style={{
                                left: `${pos.x}px`,
                                top: `${pos.y}px`,
                                opacity: isFoggy ? 0.15 : 1,
                                filter: isFoggy ? 'blur(4px)' : 'none'
                              }}
                            >
                              {/* Tile */}
                                <div
                                  className={`h-8 w-8 rounded-lg border-2 transition-all ${
                                    isPastTile
                                      ? 'border-[#8f9974] bg-[#dfe6cf]'
                                      : isCurrentTile
                                      ? 'border-[#a7b48a] bg-[#e8edd8] shadow-lg'
                                      : 'border-[#cfc7b8] bg-[#fdf9f0]'
                                  }`}
                                  style={{ imageRendering: 'pixelated' }}
                                />

                              {/* Avatar on current tile */}
                              {isCurrentTile && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                  <div className="relative" style={{ width: '48px', height: '48px' }}>
                                    {savedAvatar.body === 0 ? (
                                      <img src={body1Svg} alt="Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                                    ) : (
                                      <img src={body2Svg} alt="Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                                    )}
                                    {savedAvatar.clothing === 0 ? (
                                      <img src={clothing1Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                                    ) : (
                                      <img src={clothing2Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                                    )}
                                    {savedAvatar.hair === 0 ? (
                                      <img src={hair1Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                                    ) : (
                                      <img src={hair2Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Fog overlay gradient - obscures top of trail */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-transparent" />
                    </div>

                    {/* Trail Progress Summary */}
                    <div className="mt-4 rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-3 shadow-[0_14px_26px_rgba(79,70,51,0.18)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Progress</p>
                      <div className="mt-2 flex items-center justify-between text-sm text-[#3b3528]">
                        <span className="font-semibold">{stepsInvested}/{totalStepsNeeded} steps</span>
                        <span className="font-semibold">{dashboardProgressClamped}% completed</span>
                      </div>
                    </div>

                    {/* Time Saved / Time Lost */}
                    <div
                      className="mt-4 cursor-pointer rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-4 shadow-[0_14px_26px_rgba(79,70,51,0.18)] transition-all hover:shadow-[0_18px_34px_rgba(79,70,51,0.2)]"
                      onClick={() => setTimeCardExpanded(prev => !prev)}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7c7666]">
                        {netMinutes >= 0 ? 'Time Saved' : 'Time Lost'}
                      </p>
                      <p className={`mt-2 text-3xl font-bold ${netMinutes >= 0 ? 'text-[#6f7758]' : 'text-[#b07d5b]'}`}>
                        {netMinutes >= 0 ? '+' : '-'}{formatMinutes(Math.abs(netMinutes))}
                      </p>
                      {timeCardExpanded && (
                        <div className="mt-3 space-y-2 border-t border-[#e8e0d1] pt-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-[#6f6a5c]">Productive time</p>
                            <p className="text-sm font-bold text-[#6f7758]">+{formatMinutes(investedMinutes)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-[#6f6a5c]">Unproductive time</p>
                            <p className="text-sm font-bold text-[#b07d5b]">-{formatMinutes(lostMinutes)}</p>
                          </div>
                          <div className="flex items-center justify-between border-t border-[#e8e0d1] pt-2">
                            <p className="text-sm font-semibold text-[#3b3528]">Net result</p>
                            <p className={`text-sm font-bold ${netMinutes >= 0 ? 'text-[#6f7758]' : 'text-[#b07d5b]'}`}>
                              {netMinutes >= 0 ? '+' : '-'}{formatMinutes(Math.abs(netMinutes))}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recent App Activities */}
                    <div className="mt-6">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Recent Activities</h3>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Deep Focus</p>
                              <p className="text-xs text-[#6f6a5c]">2h in Canvas</p>
                            </div>
                            <span className="rounded-full bg-[#dfe6cf] px-2 py-1 text-xs text-[#6f7758]">+2 👣</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Project Work</p>
                              <p className="text-xs text-[#6f6a5c]">1h 30m in Notion</p>
                            </div>
                            <span className="rounded-full bg-[#dfe6cf] px-2 py-1 text-xs text-[#6f7758]">+1 👣</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Old code kept below for reference - will delete once trail is finalized */}
                    <details className="group mt-6 rounded-3xl border border-[#d8d0c2] bg-[#fbf8ef]/80 p-4 shadow-[0_16px_30px_rgba(79,70,51,0.18)]" style={{ display: 'none' }}>
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#7c7666]">Past Week Summary</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8e0d1] text-[#6f6a5c]">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-current transition-transform duration-300 group-open:rotate-180"
                            >
                              <path d="M8 10L12 14L16 10" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                          {/* Past Avatar */}
                          <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                            <div className="relative" style={{ width: '64px', height: '64px' }}>
                              {savedAvatar.body === 0 ? (
                                <img src={body1Svg} alt="Past Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={body2Svg} alt="Past Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                              {/* Clothing Layer */}
                              {savedAvatar.clothing === 0 ? (
                                <img src={clothing1Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={clothing2Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                              {/* Hair Layer */}
                              {savedAvatar.hair === 0 ? (
                                <img src={hair1Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={hair2Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                            </div>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7c7666]">Past</p>
                          </div>

                          {/* Now Avatar */}
                          <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                            <div className="relative" style={{ width: '64px', height: '64px' }}>
                              {savedAvatar.body === 0 ? (
                                <img src={body1Svg} alt="Now Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={body2Svg} alt="Now Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                              {/* Clothing Layer */}
                              {savedAvatar.clothing === 0 ? (
                                <img src={clothing1Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={clothing2Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                              {/* Hair Layer */}
                              {savedAvatar.hair === 0 ? (
                                <img src={hair1Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={hair2Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                            </div>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7c7666]">Present</p>
                          </div>

                          {/* Future Avatar */}
                          <div className="flex flex-col items-center rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                            <div className="relative" style={{ width: '64px', height: '64px' }}>
                              {savedAvatar.body === 0 ? (
                                <img src={body1Svg} alt="Future Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={body2Svg} alt="Future Avatar" className="absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                              {/* Clothing Layer */}
                              {savedAvatar.clothing === 0 ? (
                                <img src={clothing1Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={clothing2Svg} alt="Clothing" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                              {/* Hair Layer */}
                              {savedAvatar.hair === 0 ? (
                                <img src={hair1Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              ) : (
                                <img src={hair2Svg} alt="Hair" className="pointer-events-none absolute inset-0 h-full w-full" style={{ imageRendering: 'pixelated' }} />
                              )}
                            </div>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#7c7666]">Future</p>
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

                {activeTab === 'goals' && (
                  <div className="space-y-6 rounded-3xl bg-[#fbf8ef]/90 p-4 text-[#3b3528] shadow-[0_18px_40px_rgba(79,70,51,0.18)]">
                    {/* Gear Section */}
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7c7666]">Gear</p>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c8576]">Loadout</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-3">
                        {[
                          { name: 'Telescope', icon: '🔭', status: 'selected', helper: 'Connected', locked: false },
                          { name: 'Flashlight', icon: '🔦', status: 'unlocked', helper: 'Connected', locked: false },
                          { name: 'Sleeping Bag', icon: '🛏️', status: 'locked', helper: 'Connect Canvas', locked: true },
                          { name: 'Compass', icon: '🧭', status: 'locked', helper: 'Connect Instagram', locked: true },
                          { name: 'Lantern', icon: '🏮', status: 'locked', helper: 'Connect Microsoft 365', locked: true },
                        ].map((item) => {
                          const isSelected = item.status === 'selected'
                          const isLocked = item.locked
                          return (
                            <div
                              key={item.name}
                              className={`relative flex flex-col items-center justify-between rounded-2xl border p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)] transition ${
                                isSelected
                                  ? 'border-[#3b3528] bg-[#efe5d6] ring-1 ring-[#3b3528]/30'
                                  : 'border-[#d8d0c2] bg-[#fbf8ef]'
                              } ${isLocked ? 'opacity-45' : 'opacity-100'}`}
                            >
                              {isSelected && (
                                <span className="absolute right-2 top-2 text-xs text-[#6f7758]">✓</span>
                              )}
                              {isLocked && (
                                <span className="absolute right-2 top-2 text-xs text-[#7c7666]">🔒</span>
                              )}
                              <span className={`text-3xl ${isLocked ? 'grayscale' : ''}`}>{item.icon}</span>
                              <div className="mt-2">
                                <p className={`text-[11px] font-semibold ${isLocked ? 'text-[#7c7666]' : 'text-[#3b3528]'}`}>{item.name}</p>
                                <p className={`mt-1 text-[9px] ${isLocked ? 'text-[#8c8576]' : 'text-[#6f7758]'}`}>{item.helper}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Integrations Section */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7c7666]">Integrations</p>
                      <div className="mt-4 space-y-3">
                        {[
                          { name: 'Notion', detail: 'Tasks', badge: 'N', color: 'bg-[#e8e0d1] text-[#6f6a5c]', connected: true },
                          { name: 'Google Calendar', detail: 'Events', badge: 'G', color: 'bg-[#dfe6cf] text-[#6f7758]', connected: true },
                          { name: 'Canvas', detail: 'Assignments', badge: 'C', color: 'bg-[#f1d7c5] text-[#b07d5b]', connected: false },
                          { name: 'Instagram', detail: 'Usage signals', badge: 'I', color: 'bg-[#ecd9c8] text-[#b07d5b]', connected: false },
                          { name: 'Microsoft 365', detail: 'Tasks', badge: 'M', color: 'bg-[#d9e1cf] text-[#6f7758]', connected: false },
                        ].map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-3 rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] px-4 py-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]"
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.color} text-sm font-semibold`}>
                              {item.badge}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#3b3528]">{item.name}</p>
                              <p className="text-[10px] text-[#6f6a5c]">{item.detail}</p>
                            </div>
                            {item.connected ? (
                              <span className="text-xs font-semibold text-[#6f7758]">✓ Connected</span>
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

                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#7c7666]">Trail Report</p>
                      <h1 className="mt-2 text-3xl font-semibold italic text-[#3b3528] font-display">Current Trail Report</h1>
                      <p className="mt-1 text-xs text-[#6f6a5c]">Your progress, in game terms</p>
                    </div>

                    <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-4 shadow-[0_14px_26px_rgba(79,70,51,0.18)]">
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7c7666]">
                        {['today', 'week', 'month'].map((range) => (
                          <button
                            key={range}
                            onClick={() => setReportRange(range)}
                            className={`rounded-full px-3 py-1 transition ${
                              reportRange === range
                                ? 'bg-[#3b3528] text-[#fbf8ef]'
                                : 'border border-[#d8d0c2] text-[#6f6a5c]'
                            }`}
                            type="button"
                          >
                            {reportRanges[range].label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7c7666]">{reportSummary.label}</p>
                          <p className="mt-2 text-3xl font-semibold text-[#3b3528]">{reportSummary.minutes}m</p>
                          <p className="text-xs text-[#6f6a5c]">Trail minutes</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold text-[#3b3528]">{reportSummary.steps.toLocaleString()}</p>
                          <p className="text-xs text-[#6f6a5c]">Steps gained</p>
                          <p className="mt-1 text-xs font-semibold text-[#6f7758]">On trail</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-4 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Rescues</p>
                        <p className="mt-2 text-2xl font-semibold text-[#3b3528]">23</p>
                        <p className="text-xs text-[#6f6a5c]">Times you chose an alternative</p>
                      </div>
                      <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-4 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Night excluded</p>
                        <p className="mt-2 text-2xl font-semibold text-[#3b3528]">120m</p>
                        <p className="text-xs text-[#6f6a5c]">Does not count toward progress</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-4 shadow-[0_12px_22px_rgba(79,70,51,0.18)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Trail vs Drift - This Week</p>
                      <div className="mt-4 grid grid-cols-7 gap-2">
                        {weeklyTrailData.map((item) => {
                          const trailHeight = Math.round((item.trail / weeklyMax) * 100)
                          const driftHeight = Math.round((item.drift / weeklyMax) * 100)
                          return (
                            <div key={item.day} className="flex flex-col items-center gap-2 text-[10px] text-[#6f6a5c]">
                              <div className="flex h-24 w-4 flex-col-reverse overflow-hidden rounded-full bg-[#e8e0d1]">
                                <div
                                  className="w-full bg-[#8fa07a]"
                                  style={{ height: `${trailHeight}%` }}
                                  title={`Trail ${item.trail}m`}
                                />
                                <div
                                  className="w-full bg-[#c89a7b]"
                                  style={{ height: `${driftHeight}%` }}
                                  title={`Drift ${item.drift}m`}
                                />
                              </div>
                              <span>{item.day}</span>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-[10px] text-[#6f6a5c]">
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#8fa07a]" />
                          Trail minutes
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#c89a7b]" />
                          Drift minutes
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-4 shadow-[0_12px_22px_rgba(79,70,51,0.18)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Common Drift Triggers</p>
                      <div className="mt-4 space-y-3">
                        {driftTriggers.map((item) => (
                          <div key={item.name} className="flex items-center gap-3 text-sm text-[#3b3528]">
                            <span className="w-20 text-xs font-semibold text-[#6f6a5c]">{item.name}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8e0d1]">
                              <div
                                className="h-full rounded-full bg-[#c89a7b]"
                                style={{ width: `${Math.round((item.minutes / driftMax) * 100)}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-xs text-[#6f6a5c]">~{item.minutes}m</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="flex h-full flex-col">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#7c7666]">Profile</p>
                      <h1 className="mt-2 text-3xl font-semibold italic text-[#3b3528] font-display">Avatar Maker</h1>
                      <p className="mt-1 text-xs text-[#6f6a5c]">Customize your pixel character</p>
                    </div>

                    {/* Avatar Preview - Large Display */}
                    <div className="mt-4 flex-1 rounded-3xl border border-[#d8d0c2] bg-[#fbf8ef] p-5 shadow-[0_14px_26px_rgba(79,70,51,0.18)]">
                      <p className="text-center text-xs uppercase tracking-[0.2em] text-[#7c7666]">Your Avatar</p>
                      <div className="flex h-full items-center justify-center p-4">
                        {/* 64x64 grid scaled up 3x = 192px for crisp pixels */}
                        <div className="relative" style={{ width: '192px', height: '192px', imageRendering: 'pixelated' }}>
                          {/* Body Layer */}
                          {selectedBody === 0 ? (
                            <img
                              src={body1Svg}
                              alt="Body 1"
                              className="absolute inset-0 h-full w-full"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <img
                              src={body2Svg}
                              alt="Body 2"
                              className="absolute inset-0 h-full w-full"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          )}

                          {/* Clothing Layer - overlay on top of body in same 64x64 grid */}
                          {selectedClothing === 0 ? (
                            <img
                              src={clothing1Svg}
                              alt="Clothing 1"
                              className="pointer-events-none absolute inset-0 h-full w-full"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <img
                              src={clothing2Svg}
                              alt="Clothing 2"
                              className="pointer-events-none absolute inset-0 h-full w-full"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          )}

                          {/* Hair Layer - overlay on top of body in same 64x64 grid */}
                          {selectedHair === 0 ? (
                            <img
                              src={hair1Svg}
                              alt="Hair 1"
                              className="pointer-events-none absolute inset-0 h-full w-full"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          ) : (
                            <img
                              src={hair2Svg}
                              alt="Hair 2"
                              className="pointer-events-none absolute inset-0 h-full w-full"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customization Controls - Bottom */}
                    <div className="mt-4 space-y-2">
                      {/* Body Control */}
                      <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Body</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedBody(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-semibold text-[#3b3528]">Type {selectedBody + 1}</span>
                            <button
                              onClick={() => setSelectedBody(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M9 18L15 12L9 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Hair Control */}
                      <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Hair</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedHair(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-semibold text-[#3b3528]">Style {selectedHair + 1}</span>
                            <button
                              onClick={() => setSelectedHair(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M9 18L15 12L9 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Clothing Control */}
                      <div className="rounded-2xl border border-[#d8d0c2] bg-[#fbf8ef] p-3 shadow-[0_10px_18px_rgba(79,70,51,0.18)]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c7666]">Clothing</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedClothing(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-semibold text-[#3b3528]">Outfit {selectedClothing + 1}</span>
                            <button
                              onClick={() => setSelectedClothing(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c] transition-all hover:bg-[#e6ddc8]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M9 18L15 12L9 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleSaveAvatar}
                        className="w-full rounded-lg border-2 border-[#3b3528] bg-[#e6ddc8] p-3 text-sm font-semibold uppercase tracking-wide text-[#3b3528] shadow-md transition-all hover:bg-[#d9cfb8]"
                        type="button"
                      >
                        Save Avatar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-6">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 shadow-md transition-all ${
                      activeTab === 'home'
                        ? 'border-[#3b3528] bg-[#e6ddc8] text-[#3b3528]'
                        : 'border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c]'
                    }`}
                    onClick={() => setActiveTab('home')}
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="square" strokeLinejoin="miter">
                      <path d="M4 10L12 4L20 10" strokeWidth="2.5" />
                      <path d="M6 10V20H18V10" strokeWidth="2.5" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Home</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 shadow-md transition-all ${
                      activeTab === 'goals'
                        ? 'border-[#3b3528] bg-[#e6ddc8] text-[#3b3528]'
                        : 'border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c]'
                    }`}
                    onClick={() => setActiveTab('goals')}
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="square" strokeLinejoin="miter">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2.5" />
                      <path d="M9 12h6M12 9v6" strokeWidth="2.5" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Gear</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 shadow-md transition-all ${
                      activeTab === 'stats'
                        ? 'border-[#3b3528] bg-[#e6ddc8] text-[#3b3528]'
                        : 'border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c]'
                    }`}
                    onClick={() => setActiveTab('stats')}
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="square" strokeLinejoin="miter">
                      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2.5" />
                      <path d="M8 9h8M8 13h5" strokeWidth="2.5" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Tasks</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 shadow-md transition-all ${
                      activeTab === 'profile'
                        ? 'border-[#3b3528] bg-[#e6ddc8] text-[#3b3528]'
                        : 'border-[#6f6a5c] bg-[#fbf8ef] text-[#6f6a5c]'
                    }`}
                    onClick={() => setActiveTab('profile')}
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="square" strokeLinejoin="miter">
                      <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" strokeWidth="2.5" />
                      <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" strokeWidth="2.5" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

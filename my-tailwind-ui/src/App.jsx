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
  const [savedAvatar, setSavedAvatar] = useState({
    body: 0,
    hair: 0,
    clothing: 0
  })

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
  const balanceScore = Math.round(((investedMinutes - lostMinutes) / totalMinutes) * 100)
  const trendScore = Math.min(100, Math.max(0, 50 + balanceScore))

  // Game progression state
  const tasksCompleted = 3 // Number of tasks finished today
  const totalSteps = Math.round(investedMinutes / 60) + tasksCompleted // 1 step per hour + 1 per task (4 + 3 = 7 steps)
  const currentTile = Math.min(19, totalSteps) // Current position on trail (max 19 for 20 tiles)
  const itemsCollected = 2 // App integrations (each app connected = 1 item that helps your journey)
  const fogRevealDistance = 5 // How many tiles ahead are visible

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
    <div className="relative min-h-screen bg-[#0a1410] text-white">
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="relative rounded-[48px] border border-[#d4af37]/20 p-1">
          <div className="relative h-[680px] w-[330px] overflow-hidden rounded-[46px] bg-[#0d1914]">
            <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-[#0a1410]" />

            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-6 pt-6 text-[11px] text-[#d4af37]/60">
                <span className="font-light tracking-wide">10:42</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-[#d4af37]/80" />
                  <span className="h-1 w-1 rounded-full bg-[#d4af37]/80" />
                  <div className="flex h-2.5 w-5 items-center justify-start rounded-sm border border-[#d4af37]/30 px-0.5">
                    <div className="h-1.5 w-2.5 rounded-sm bg-[#d4af37]/80" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-6 pt-8">
                {activeTab === 'home' && (
                  <>
                    {/* Header with stats */}
                    <div className="mb-6">
                      {/* Top row: label left, time right */}
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#7fb69e]/60 font-light">The Trail</p>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-0.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="stroke-[#7fb69e]/60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="text-sm font-light text-[#d4af37]">{formatMinutes(investedMinutes)}</span>
                          </div>
                          <p className="text-[9px] font-light text-[#7fb69e]/60">invested</p>
                        </div>
                      </div>

                      {/* Big step count */}
                      <div className="mb-3">
                        <div className="flex items-baseline gap-2">
                          <h1 className="text-[52px] font-light text-[#d4af37] leading-none tracking-tight">{totalSteps}</h1>
                          <span className="text-sm font-light text-[#7fb69e]/60 pb-1">steps</span>
                        </div>
                      </div>

                      {/* Progress section */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-light text-[#7fb69e]/60">Start</span>
                          <span className="text-[11px] font-light text-[#d4af37]">{Math.round((totalSteps / 20) * 100)}% explored</span>
                          <span className="text-[9px] font-light text-[#7fb69e]/60">Summit</span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1 w-full rounded-full bg-[#7fb69e]/20 mb-2">
                          <div
                            className="h-full rounded-full bg-[#d4af37]"
                            style={{ width: `${(totalSteps / 20) * 100}%` }}
                          />
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 w-1 rounded-full bg-[#7fb69e]" />
                          <span className="text-[9px] font-light text-[#7fb69e]">On trail</span>
                        </div>
                      </div>
                    </div>

                    {/* Trail View */}
                    <div className="relative h-[420px] overflow-hidden rounded-2xl border border-[#d4af37]/10 bg-[#0a1410] p-5">
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
                                className={`h-6 w-6 rounded-full transition-all ${
                                  isPastTile
                                    ? 'border border-[#7fb69e]/40 bg-[#7fb69e]/20'
                                    : isCurrentTile
                                    ? 'border-2 border-[#d4af37] bg-[#d4af37]/30'
                                    : 'border border-[#9b8ac4]/20 bg-transparent'
                                }`}
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

                      {/* Fog overlay - obscures top of trail */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a1410] via-transparent to-transparent" />
                    </div>

                    {/* Time Invested This Week */}
                    <div className="mt-8 rounded-xl border border-[#d4af37]/10 bg-[#d4af37]/5 p-5">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#7fb69e]/60 font-light">Time Invested This Week</p>
                      <p className="mt-3 text-4xl font-light text-[#d4af37]">{formatMinutes(investedMinutes)}</p>
                      <p className="mt-2 text-xs text-[#7fb69e] font-light">+22% from last week</p>
                    </div>

                    {/* Recent App Activities */}
                    <div className="mt-8">
                      <h3 className="text-[10px] font-light uppercase tracking-[0.25em] text-[#7fb69e]/60 mb-4">Recent Activities</h3>
                      <div className="space-y-3">
                        <div className="rounded-xl border border-[#7fb69e]/10 bg-[#7fb69e]/5 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-light text-[#d4af37]">Deep Focus</p>
                              <p className="text-xs text-[#7fb69e]/60 font-light mt-0.5">2h in Canvas</p>
                            </div>
                            <span className="text-xs text-[#7fb69e] font-light">+2 👣</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-[#9b8ac4]/10 bg-[#9b8ac4]/5 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-light text-[#d4af37]">Project Work</p>
                              <p className="text-xs text-[#7fb69e]/60 font-light mt-0.5">1h 30m in Notion</p>
                            </div>
                            <span className="text-xs text-[#7fb69e] font-light">+1 👣</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Old code kept below for reference - will delete once trail is finalized */}
                    <details className="group mt-6 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-[0_16px_30px_rgba(87,61,140,0.12)]" style={{ display: 'none' }}>
                      <summary className="cursor-pointer list-none">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Past Week Summary</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f2ecff] text-[#6b6286]">
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
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Past</p>
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
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Present</p>
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
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Future</p>
                          </div>
                        </div>
                      </summary>

                      <div className="mt-4 space-y-2 text-sm text-[#5b5270]">
                        <p>{summaryCopy.line1}</p>
                        <p>{summaryCopy.line2}</p>
                      </div>
                    </details>
                  </>
                )}

                {activeTab === 'goals' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#7fb69e]/60 font-light">Integrations</p>
                      <h1 className="mt-3 text-3xl font-light text-[#d4af37]">Connected Apps</h1>
                      <p className="mt-2 text-xs text-[#7fb69e]/60 font-light">Earn camping items by connecting apps</p>
                    </div>

                    {/* Connected Apps with Items */}
                    <div className="rounded-xl border border-[#7fb69e]/10 bg-[#7fb69e]/5 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7fb69e]/10 text-xl">📚</div>
                        <div className="flex-1">
                          <p className="text-sm font-light text-[#d4af37]">Canvas LMS</p>
                          <p className="text-xs text-[#7fb69e]/60 font-light mt-0.5">Tracks study time</p>
                        </div>
                        <span className="text-sm font-light text-[#7fb69e]">✓</span>
                      </div>
                      <div className="mt-4 rounded-lg border border-[#7fb69e]/10 bg-[#7fb69e]/5 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⛺</span>
                          <div>
                            <p className="text-xs font-light text-[#d4af37]">Study Tent</p>
                            <p className="text-[10px] text-[#7fb69e]/60 font-light mt-0.5">+2 fog reveal distance</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#9b8ac4]/10 bg-[#9b8ac4]/5 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9b8ac4]/10 text-xl">💼</div>
                        <div className="flex-1">
                          <p className="text-sm font-light text-[#d4af37]">Notion</p>
                          <p className="text-xs text-[#7fb69e]/60 font-light mt-0.5">Tracks work time</p>
                        </div>
                        <span className="text-sm font-light text-[#7fb69e]">✓</span>
                      </div>
                      <div className="mt-4 rounded-lg border border-[#9b8ac4]/10 bg-[#9b8ac4]/5 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔦</span>
                          <div>
                            <p className="text-xs font-light text-[#d4af37]">Flashlight</p>
                            <p className="text-[10px] text-[#7fb69e]/60 font-light mt-0.5">See path connections</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/10 bg-[#d4af37]/5 p-5 opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4af37]/10 text-xl">🎯</div>
                        <div className="flex-1">
                          <p className="text-sm font-light text-[#d4af37]/70">Google Calendar</p>
                          <p className="text-xs text-[#d4af37]/50 font-light mt-0.5">Add to unlock</p>
                        </div>
                        <button className="rounded-lg border border-[#d4af37]/20 px-3 py-1.5 text-[10px] font-light text-[#d4af37] hover:bg-[#d4af37]/10 transition-all">Connect</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#7fb69e]/60 font-light">Tasks</p>
                      <h1 className="mt-3 text-3xl font-light text-[#d4af37]">Today's Tasks</h1>
                      <p className="mt-2 text-xs text-[#7fb69e]/60 font-light">Complete tasks to earn steps</p>
                    </div>

                    {/* Goal Categories */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-[#7fb69e]/10 bg-[#7fb69e]/5 p-4 text-center">
                        <p className="text-[9px] font-light uppercase tracking-wider text-[#7fb69e]/60">Personal</p>
                        <p className="mt-2 text-xl font-light text-[#7fb69e]">2/5</p>
                      </div>
                      <div className="rounded-lg border border-[#d4af37]/10 bg-[#d4af37]/5 p-4 text-center">
                        <p className="text-[9px] font-light uppercase tracking-wider text-[#7fb69e]/60">Academic</p>
                        <p className="mt-2 text-xl font-light text-[#d4af37]">3/6</p>
                      </div>
                      <div className="rounded-lg border border-[#9b8ac4]/10 bg-[#9b8ac4]/5 p-4 text-center">
                        <p className="text-[9px] font-light uppercase tracking-wider text-[#7fb69e]/60">Professional</p>
                        <p className="mt-2 text-xl font-light text-[#d4af37]">1/4</p>
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-3">
                      <div className="rounded-xl border border-[#d4af37]/10 bg-[#d4af37]/5 p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-4 w-4 rounded-sm border-[#d4af37]/30 accent-[#d4af37]" />
                          <div className="flex-1">
                            <p className="text-sm font-light text-[#d4af37]">Finish math homework</p>
                            <p className="text-xs text-[#7fb69e]/60 font-light mt-0.5">Academic • Due tonight</p>
                          </div>
                          <span className="text-xs font-light text-[#7fb69e]">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#7fb69e]/10 bg-[#7fb69e]/5 p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-4 w-4 rounded-sm border-[#7fb69e]/30 accent-[#7fb69e]" />
                          <div className="flex-1">
                            <p className="text-sm font-light text-[#d4af37]">Read 20 pages</p>
                            <p className="text-xs text-[#7fb69e]/50 font-light mt-0.5">Personal • Daily goal</p>
                          </div>
                          <span className="text-xs font-light text-[#7fb69e]">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#9b8ac4]/10 bg-[#9b8ac4]/5 p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-4 w-4 rounded-sm border-[#9b8ac4]/30 accent-[#9b8ac4]" />
                          <div className="flex-1">
                            <p className="text-sm font-light text-[#d4af37]">Update portfolio site</p>
                            <p className="text-xs text-[#7fb69e]/60 font-light mt-0.5">Professional • This week</p>
                          </div>
                          <span className="text-xs font-light text-[#7fb69e]">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#d4af37]/10 bg-[#d4af37]/5 p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-4 w-4 rounded-sm border-[#d4af37]/30 accent-[#d4af37]" />
                          <div className="flex-1">
                            <p className="text-sm font-light text-[#d4af37]">Study for physics exam</p>
                            <p className="text-xs text-[#7fb69e]/60 font-light mt-0.5">Academic • Tomorrow</p>
                          </div>
                          <span className="text-xs font-light text-[#7fb69e]">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#7fb69e]/10 bg-[#7fb69e]/5 p-4">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-4 w-4 rounded-sm border-[#7fb69e]/30 accent-[#7fb69e]" />
                          <div className="flex-1">
                            <p className="text-sm font-light text-[#d4af37]">Morning workout</p>
                            <p className="text-xs text-[#7fb69e]/50 font-light mt-0.5">Personal • Daily habit</p>
                          </div>
                          <span className="text-xs font-light text-[#7fb69e]">+1 👣</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="flex h-full flex-col">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-[#7fb69e]/60 font-light">Profile</p>
                      <h1 className="mt-3 text-3xl font-light text-[#d4af37]">Avatar Maker</h1>
                      <p className="mt-2 text-xs text-[#7fb69e]/60 font-light">Customize your character</p>
                    </div>

                    {/* Avatar Preview - Large Display */}
                    <div className="mt-6 flex-1 rounded-xl border border-[#d4af37]/10 bg-[#0a1410] p-6">
                      <p className="text-center text-[10px] uppercase tracking-[0.25em] text-[#7fb69e]/60 font-light">Your Avatar</p>
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
                    <div className="mt-6 space-y-3">
                      {/* Body Control */}
                      <div className="rounded-xl border border-[#7fb69e]/10 bg-[#7fb69e]/5 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-light uppercase tracking-wider text-[#7fb69e]/60">Body</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedBody(prev => prev === 0 ? 1 : 0)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#7fb69e]/20 text-[#7fb69e] transition-all hover:bg-[#7fb69e]/10"
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2" strokeLinecap="round">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-light text-[#d4af37]">Type {selectedBody + 1}</span>
                            <button
                              onClick={() => setSelectedBody(prev => prev === 0 ? 1 : 0)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#7fb69e]/20 text-[#7fb69e] transition-all hover:bg-[#7fb69e]/10"
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2" strokeLinecap="round">
                                <path d="M9 18L15 12L9 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Hair Control */}
                      <div className="rounded-xl border border-[#d4af37]/10 bg-[#d4af37]/5 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-light uppercase tracking-wider text-[#7fb69e]/60">Hair</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedHair(prev => prev === 0 ? 1 : 0)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#d4af37]/20 text-[#d4af37] transition-all hover:bg-[#d4af37]/10"
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2" strokeLinecap="round">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-light text-[#d4af37]">Style {selectedHair + 1}</span>
                            <button
                              onClick={() => setSelectedHair(prev => prev === 0 ? 1 : 0)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#d4af37]/20 text-[#d4af37] transition-all hover:bg-[#d4af37]/10"
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2" strokeLinecap="round">
                                <path d="M9 18L15 12L9 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Clothing Control */}
                      <div className="rounded-xl border border-[#9b8ac4]/10 bg-[#9b8ac4]/5 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-light uppercase tracking-wider text-[#7fb69e]/60">Clothing</p>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedClothing(prev => prev === 0 ? 1 : 0)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#9b8ac4]/20 text-[#9b8ac4] transition-all hover:bg-[#9b8ac4]/10"
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2" strokeLinecap="round">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-light text-[#d4af37]">Outfit {selectedClothing + 1}</span>
                            <button
                              onClick={() => setSelectedClothing(prev => prev === 0 ? 1 : 0)}
                              className="flex h-6 w-6 items-center justify-center rounded-md border border-[#9b8ac4]/20 text-[#9b8ac4] transition-all hover:bg-[#9b8ac4]/10"
                              type="button"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2" strokeLinecap="round">
                                <path d="M9 18L15 12L9 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={handleSaveAvatar}
                        className="w-full rounded-xl border border-[#d4af37]/20 bg-[#d4af37]/10 p-4 text-sm font-light uppercase tracking-wide text-[#d4af37] transition-all hover:bg-[#d4af37]/15"
                        type="button"
                      >
                        Save Avatar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                <div className="grid grid-cols-4 gap-3">
                  <button
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                      activeTab === 'home'
                        ? 'border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]'
                        : 'border-transparent text-[#7fb69e]/50'
                    }`}
                    onClick={() => setActiveTab('home')}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="1.5" />
                      <polyline points="9 22 9 12 15 12 15 22" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[9px] font-light uppercase tracking-wider">Trail</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                      activeTab === 'goals'
                        ? 'border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]'
                        : 'border-transparent text-[#7fb69e]/50'
                    }`}
                    onClick={() => setActiveTab('goals')}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5" />
                      <line x1="9" y1="9" x2="15" y2="9" strokeWidth="1.5" />
                      <line x1="9" y1="15" x2="15" y2="15" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[9px] font-light uppercase tracking-wider">Apps</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                      activeTab === 'stats'
                        ? 'border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]'
                        : 'border-transparent text-[#7fb69e]/50'
                    }`}
                    onClick={() => setActiveTab('stats')}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" strokeWidth="1.5" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[9px] font-light uppercase tracking-wider">Tasks</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                      activeTab === 'profile'
                        ? 'border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]'
                        : 'border-transparent text-[#7fb69e]/50'
                    }`}
                    onClick={() => setActiveTab('profile')}
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="1.5" />
                      <circle cx="12" cy="7" r="4" strokeWidth="1.5" />
                    </svg>
                    <span className="text-[9px] font-light uppercase tracking-wider">Avatar</span>
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

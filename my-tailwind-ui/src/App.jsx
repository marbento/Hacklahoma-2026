import { useState } from 'react'
// Import your SVG assets here
import body1Svg from './assets/body1.svg'
import body2Svg from './assets/body2.svg'
import hair1Svg from './assets/hair1.svg'
import hair2Svg from './assets/hair2.svg'
import clothing1Svg from './assets/cloth1.svg'
import clothing2Svg from './assets/cloth2.svg'

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
    <div className="relative min-h-screen bg-[#f7f2ff] text-[#16141f] font-pixel">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-10 h-80 w-80 rounded-full bg-[#ffb347]/40 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-40px] h-96 w-96 rounded-full bg-[#6ee7ff]/40 blur-3xl" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#2d23451a_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="relative rounded-[48px] bg-gradient-to-br from-white via-white/70 to-white/30 p-[2px] shadow-[0_30px_90px_rgba(58,38,97,0.25)]">
          <div className="relative h-[680px] w-[330px] overflow-hidden rounded-[46px] bg-gradient-to-b from-white via-[#f9f6ff] to-[#f1ecff]">
            <div className="absolute left-1/2 top-3 h-6 w-32 -translate-x-1/2 rounded-full border border-black/10 bg-white/80" />

            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-5 pt-5 text-xs text-[#5f5a73]">
                <span className="font-medium tracking-[0.2em]">10:42</span>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
                  <div className="flex h-3 w-6 items-center justify-start rounded-full border border-black/20 px-0.5">
                    <div className="h-2 w-3 rounded-full bg-[#1a1528]/70" />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-6 pt-6">
                {activeTab === 'home' && (
                  <>
                    {/* Header with stats */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-[#8a83a3]">Your Journey</p>
                        <h1 className="mt-2 text-2xl font-semibold">The Trail</h1>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1 rounded-xl bg-white px-2 py-1 shadow-md">
                          <span className="text-lg">👣</span>
                          <span className="text-xs font-bold text-[#3c2e62]">{totalSteps}</span>
                        </div>
                        <div className="flex items-center gap-1 rounded-xl bg-white px-2 py-1 shadow-md">
                          <span className="text-lg">📦</span>
                          <span className="text-xs font-bold text-[#3c2e62]">{itemsCollected}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trail View */}
                    <div className="relative mt-6 h-[450px] overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-b from-[#e8f4ff] via-[#f0e8ff] to-[#ffe8f4] p-4 shadow-[0_16px_30px_rgba(87,61,140,0.12)]">
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
                                    ? 'border-emerald-400 bg-emerald-100'
                                    : isCurrentTile
                                    ? 'border-cyan-400 bg-cyan-100 shadow-lg'
                                    : 'border-gray-300 bg-white/60'
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

                    {/* Time Invested This Week */}
                    <div className="mt-6 rounded-2xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Time Invested This Week</p>
                      <p className="mt-2 text-3xl font-bold text-[#2f254b]">{formatMinutes(investedMinutes)}</p>
                      <p className="mt-1 text-xs text-[#6b6286]">+22% from last week</p>
                    </div>

                    {/* Recent App Activities */}
                    <div className="mt-6">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Recent Activities</h3>
                      <div className="mt-3 space-y-2">
                        <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Deep Focus</p>
                              <p className="text-xs text-[#6b6286]">2h in Canvas</p>
                            </div>
                            <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-700">+2 👣</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Project Work</p>
                              <p className="text-xs text-[#6b6286]">1h 30m in Notion</p>
                            </div>
                            <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-700">+1 👣</span>
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

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <details className="group rounded-2xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                        <summary className="flex cursor-pointer list-none items-start justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#8a83a3]">
                              {balanceScore > 0 ? 'Time Invested' : 'Time Lost'}
                            </p>
                            <p className="mt-2 font-bold" style={{ fontSize: '32px' }}>
                              {formatMinutes(balanceScore > 0 ? investedMinutes : lostMinutes)}
                            </p>
                            <p className="mt-1 text-xs text-[#6b6286]">
                              {balanceScore > 0 ? 'Up 22% from last week' : 'Down 15% from last week'}
                            </p>
                          </div>
                          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#f2ecff] text-[#6b6286]">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-current transition-transform duration-300 group-open:rotate-180"
                            >
                              <path d="M6 9L12 15L18 9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </summary>
                        <div className="mt-4 space-y-4">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#8a83a3]">
                              <span>Time Invested</span>
                              <span>{formatMinutes(investedMinutes)}</span>
                            </div>
                            <div className="mt-3 h-2 w-full rounded-full bg-[#efe8ff]">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                                style={{ width: `${investedPct}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#8a83a3]">
                              <span>Time Lost</span>
                              <span>{formatMinutes(lostMinutes)}</span>
                            </div>
                            <div className="mt-3 h-2 w-full rounded-full bg-[#ffe7ef]">
                              <div
                                className="h-2 rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
                                style={{ width: `${lostPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </details>
                      <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                        <p className="text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Phone Places</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-emerald-700">Focus Apps +3</span>
                          <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-rose-700">Doom Scroll -4</span>
                        </div>
                        <p className="mt-2 text-xs text-[#6b6286]">Good mix, but risky</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Recent Activities</h3>
                        <button className="rounded-lg border-2 border-[#3b7d6a] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#3b7d6a] transition-all hover:bg-[#e8fff5]">See all</button>
                      </div>
                      <div className="mt-3 space-y-3">
                        <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Deep Focus</p>
                              <p className="text-xs text-[#6b6286]">2h in Canvas</p>
                            </div>
                            <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs text-emerald-700">+4</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Late Scroll</p>
                              <p className="text-xs text-[#6b6286]">1h 05m short-video loop</p>
                            </div>
                            <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-700">-2</span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Auto-play Spiral</p>
                              <p className="text-xs text-[#6b6286]">Late night streaming</p>
                            </div>
                            <span className="rounded-full bg-rose-400/20 px-2 py-1 text-xs text-rose-700">-3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'goals' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#8a83a3]">Integrations</p>
                      <h1 className="mt-2 text-2xl font-semibold">Connected Apps</h1>
                      <p className="mt-1 text-xs text-[#6b6286]">Earn camping items by connecting apps</p>
                    </div>

                    {/* Connected Apps with Items */}
                    <div className="rounded-3xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-200 text-2xl">📚</div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-[#2f254b]">Canvas LMS</p>
                          <p className="text-xs text-[#6b6286]">Tracks study time</p>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">✓</span>
                      </div>
                      <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⛺</span>
                          <div>
                            <p className="text-sm font-semibold text-[#2f254b]">Study Tent</p>
                            <p className="text-xs text-[#6b6286]">+2 fog reveal distance</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-200 text-2xl">💼</div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-[#2f254b]">Notion</p>
                          <p className="text-xs text-[#6b6286]">Tracks work time</p>
                        </div>
                        <span className="text-lg font-bold text-purple-600">✓</span>
                      </div>
                      <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🔦</span>
                          <div>
                            <p className="text-sm font-semibold text-[#2f254b]">Flashlight</p>
                            <p className="text-xs text-[#6b6286]">See path connections</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)] opacity-60">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 text-2xl">🎯</div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-[#2f254b]">Google Calendar</p>
                          <p className="text-xs text-[#6b6286]">Add to unlock</p>
                        </div>
                        <button className="rounded-lg bg-gray-200 px-3 py-1 text-xs font-bold text-gray-600">Connect</button>
                      </div>
                      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl opacity-40">🧭</span>
                          <div>
                            <p className="text-sm font-semibold text-[#2f254b]">Compass</p>
                            <p className="text-xs text-[#6b6286]">Points to next goal</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#8a83a3]">Tasks</p>
                      <h1 className="mt-2 text-2xl font-semibold">Today's Tasks</h1>
                      <p className="mt-1 text-xs text-[#6b6286]">Complete tasks to earn steps</p>
                    </div>

                    {/* Goal Categories */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-xl border border-white/60 bg-white p-3 text-center shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8a83a3]">Personal</p>
                        <p className="mt-1 text-lg font-bold text-emerald-600">2/5</p>
                      </div>
                      <div className="rounded-xl border border-white/60 bg-white p-3 text-center shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8a83a3]">Academic</p>
                        <p className="mt-1 text-lg font-bold text-cyan-600">3/6</p>
                      </div>
                      <div className="rounded-xl border border-white/60 bg-white p-3 text-center shadow-md">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#8a83a3]">Professional</p>
                        <p className="mt-1 text-lg font-bold text-purple-600">1/4</p>
                      </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-2">
                      <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-5 w-5 rounded border-emerald-400" />
                          <div className="flex-1">
                            <p className="text-base font-semibold text-[#2f254b]">Finish math homework</p>
                            <p className="text-xs text-[#6b6286]">Academic • Due tonight</p>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-5 w-5 rounded border-cyan-400" />
                          <div className="flex-1">
                            <p className="text-base font-semibold text-[#2f254b]">Read 20 pages</p>
                            <p className="text-xs text-[#6b6286]">Personal • Daily goal</p>
                          </div>
                          <span className="text-sm font-bold text-cyan-600">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-5 w-5 rounded border-purple-400" />
                          <div className="flex-1">
                            <p className="text-base font-semibold text-[#2f254b]">Update portfolio site</p>
                            <p className="text-xs text-[#6b6286]">Professional • This week</p>
                          </div>
                          <span className="text-sm font-bold text-purple-600">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-5 w-5 rounded border-cyan-400" />
                          <div className="flex-1">
                            <p className="text-base font-semibold text-[#2f254b]">Study for physics exam</p>
                            <p className="text-xs text-[#6b6286]">Academic • Tomorrow</p>
                          </div>
                          <span className="text-sm font-bold text-cyan-600">+1 👣</span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/60 bg-white p-4 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="h-5 w-5 rounded border-emerald-400" />
                          <div className="flex-1">
                            <p className="text-base font-semibold text-[#2f254b]">Morning workout</p>
                            <p className="text-xs text-[#6b6286]">Personal • Daily habit</p>
                          </div>
                          <span className="text-sm font-bold text-emerald-600">+1 👣</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="flex h-full flex-col">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#8a83a3]">Profile</p>
                      <h1 className="mt-2 text-2xl font-semibold">Avatar Maker</h1>
                      <p className="mt-1 text-xs text-[#6b6286]">Customize your pixel character</p>
                    </div>

                    {/* Avatar Preview - Large Display */}
                    <div className="mt-4 flex-1 rounded-3xl border border-white/60 bg-white p-5 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                      <p className="text-center text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Your Avatar</p>
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
                      <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Body</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedBody(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6b6286] bg-white text-[#6b6286] transition-all hover:bg-[#e8dcff]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-semibold text-[#2f254b]">Type {selectedBody + 1}</span>
                            <button
                              onClick={() => setSelectedBody(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6b6286] bg-white text-[#6b6286] transition-all hover:bg-[#e8dcff]"
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
                      <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Hair</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedHair(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6b6286] bg-white text-[#6b6286] transition-all hover:bg-[#e8dcff]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-semibold text-[#2f254b]">Style {selectedHair + 1}</span>
                            <button
                              onClick={() => setSelectedHair(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6b6286] bg-white text-[#6b6286] transition-all hover:bg-[#e8dcff]"
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
                      <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Clothing</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedClothing(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6b6286] bg-white text-[#6b6286] transition-all hover:bg-[#e8dcff]"
                              type="button"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeWidth="2.5" strokeLinecap="square">
                                <path d="M15 18L9 12L15 6" />
                              </svg>
                            </button>
                            <span className="min-w-[60px] text-center text-xs font-semibold text-[#2f254b]">Outfit {selectedClothing + 1}</span>
                            <button
                              onClick={() => setSelectedClothing(prev => prev === 0 ? 1 : 0)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#6b6286] bg-white text-[#6b6286] transition-all hover:bg-[#e8dcff]"
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
                        className="w-full rounded-lg border-2 border-[#2f254b] bg-[#e8dcff] p-3 text-sm font-semibold uppercase tracking-wide text-[#2f254b] shadow-md transition-all hover:bg-[#d6c9ff]"
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
                        ? 'border-[#2f254b] bg-[#e8dcff] text-[#2f254b]'
                        : 'border-[#6b6286] bg-white text-[#6b6286]'
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
                        ? 'border-[#2f254b] bg-[#e8dcff] text-[#2f254b]'
                        : 'border-[#6b6286] bg-white text-[#6b6286]'
                    }`}
                    onClick={() => setActiveTab('goals')}
                    type="button"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current" strokeLinecap="square" strokeLinejoin="miter">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2.5" />
                      <path d="M9 12h6M12 9v6" strokeWidth="2.5" />
                    </svg>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Apps</span>
                  </button>
                  <button
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 shadow-md transition-all ${
                      activeTab === 'stats'
                        ? 'border-[#2f254b] bg-[#e8dcff] text-[#2f254b]'
                        : 'border-[#6b6286] bg-white text-[#6b6286]'
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
                        ? 'border-[#2f254b] bg-[#e8dcff] text-[#2f254b]'
                        : 'border-[#6b6286] bg-white text-[#6b6286]'
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

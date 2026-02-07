function App() {
  const investedMinutes = 220
  const lostMinutes = 85
  const totalMinutes = investedMinutes + lostMinutes
  const investedPct = Math.round((investedMinutes / totalMinutes) * 100)
  const lostPct = Math.round((lostMinutes / totalMinutes) * 100)
  const balanceScore = Math.round(((investedMinutes - lostMinutes) / totalMinutes) * 100)
  const trendScore = Math.min(100, Math.max(0, 50 + balanceScore))
  const summaryTone =
    balanceScore >= 25
      ? 'winning'
      : balanceScore <= -15
        ? 'messy'
        : 'wobbly'
  const summaryCopy = {
    winning: {
      past: 'Locked in',
      now: 'Focused',
      future: 'Glowing',
      line1: 'You stacked deep-focus sessions and dodged the autoplay traps.',
      line2: 'Future you is booking a victory lap (and actually paying for it).',
    },
    wobbly: {
      past: 'Balanced',
      now: 'Wobbly',
      future: 'Budget hero?',
      line1: 'You hit a few strong focus blocks, but the scroll loops fought back.',
      line2: 'Future you is ok, but still counting couch-cushion coins.',
    },
    messy: {
      past: 'Hopeful',
      now: 'Chaotic',
      future: 'Broke-ish',
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
    <div className="relative min-h-screen bg-[#f7f2ff] text-[#16141f]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-10 h-80 w-80 rounded-full bg-[#ffb347]/40 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-40px] h-96 w-96 rounded-full bg-[#6ee7ff]/40 blur-3xl" />
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#2d23451a_1px,transparent_1px)] [background-size:18px_18px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="relative rounded-[48px] bg-gradient-to-br from-white via-white/70 to-white/30 p-[2px] shadow-[0_30px_90px_rgba(58,38,97,0.25)]">
          <div className="relative h-[680px] w-[330px] overflow-hidden rounded-[46px] bg-gradient-to-b from-white via-[#f9f6ff] to-[#f1ecff]">
            <div className="absolute left-1/2 top-3 h-6 w-32 -translate-x-1/2 rounded-full border border-black/10 bg-white/80" />

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

            <div className="px-5 pb-24 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#8a83a3]">Screenline</p>
                  <h1 className="mt-2 text-2xl font-semibold">Weekly Dashboard</h1>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_12px_20px_rgba(87,61,140,0.18)]">
                  <span className="text-sm font-semibold text-[#3c2e62]">ML</span>
                </div>
              </div>

              <details className="group mt-6 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-[0_16px_30px_rgba(87,61,140,0.12)]">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Past Week Summary</p>
                      <h2 className="mt-2 text-lg font-semibold">
                        Trend Score: {trendScore}/100
                      </h2>
                      <p className="mt-1 text-xs text-[#6b6286]">Time saved + app choices</p>
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
                    <div className="rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/20 text-amber-600">
                        <span className="text-xs font-semibold">PAST</span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8a83a3]">You then</p>
                      <p className="mt-1 text-xs text-[#5b5270]">{summaryCopy.past}</p>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-600">
                        <span className="text-xs font-semibold">NOW</span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8a83a3]">You now</p>
                      <p className="mt-1 text-xs text-[#5b5270]">{summaryCopy.now}</p>
                    </div>
                    <div className="rounded-2xl border border-white/60 bg-white p-3 text-center shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-rose-400/20 text-rose-600">
                        <span className="text-xs font-semibold">FUT</span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#8a83a3]">You later</p>
                      <p className="mt-1 text-xs text-[#5b5270]">{summaryCopy.future}</p>
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
                      <p className="text-xs uppercase tracking-[0.2em] text-[#8a83a3]">Time Saved</p>
                      <p className="mt-2 text-lg font-semibold">{formatMinutes(investedMinutes)}</p>
                      <p className="mt-1 text-xs text-[#6b6286]">Up 22% from last week</p>
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
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#8a83a3]">
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
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#8a83a3]">
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
                  <button className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3b7d6a]">See all</button>
                </div>
                <div className="mt-3 space-y-3">
                  <div className="rounded-2xl border border-white/60 bg-white p-3 shadow-[0_10px_18px_rgba(87,61,140,0.12)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">Deep Focus</p>
                        <p className="text-xs text-[#6b6286]">2h in Focus Lab</p>
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

              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Goals</h3>
                      <p className="mt-2 text-base font-semibold">Build a daily focus streak</p>
                      <p className="mt-1 text-xs text-[#6b6286]">On track: 4/7 days</p>
                    </div>
                    <span className="rounded-full bg-emerald-400/20 px-2.5 py-1 text-xs text-emerald-700">+2 score</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#8a83a3]">
                      <span>Weekly progress</span>
                      <span>57%</span>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-[#efe8ff]">
                      <div className="h-2 w-[57%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-emerald-700">Focus Lab +2</span>
                      <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-rose-700">Auto-play -1</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Stats</h3>
                      <p className="mt-2 text-base font-semibold">Time invested by day</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#6b6286]">Last 7</span>
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <div className="flex h-12 w-5 items-end rounded-full bg-[#efe8ff]">
                      <div className="h-6 w-full rounded-full bg-[#9fe8ff]" />
                    </div>
                    <div className="flex h-12 w-5 items-end rounded-full bg-[#efe8ff]">
                      <div className="h-9 w-full rounded-full bg-[#7dd3fc]" />
                    </div>
                    <div className="flex h-12 w-5 items-end rounded-full bg-[#efe8ff]">
                      <div className="h-4 w-full rounded-full bg-[#c4b5fd]" />
                    </div>
                    <div className="flex h-12 w-5 items-end rounded-full bg-[#efe8ff]">
                      <div className="h-10 w-full rounded-full bg-[#a7f3d0]" />
                    </div>
                    <div className="flex h-12 w-5 items-end rounded-full bg-[#efe8ff]">
                      <div className="h-7 w-full rounded-full bg-[#f9a8d4]" />
                    </div>
                    <div className="flex h-12 w-5 items-end rounded-full bg-[#efe8ff]">
                      <div className="h-11 w-full rounded-full bg-[#fcd34d]" />
                    </div>
                    <div className="flex h-12 w-5 items-end rounded-full bg-[#efe8ff]">
                      <div className="h-5 w-full rounded-full bg-[#93c5fd]" />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#6b6286]">Peaks boost your score; dips pull it down.</p>
                </div>

                <div className="rounded-3xl border border-white/60 bg-white p-4 shadow-[0_14px_26px_rgba(87,61,140,0.12)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a83a3]">Profile</h3>
                      <p className="mt-2 text-base font-semibold">Avatar maker</p>
                      <p className="mt-1 text-xs text-[#6b6286]">Pixel assets coming soon</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2ecff] text-[#6b6286]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="stroke-current">
                        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" strokeWidth="1.6" />
                        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl border border-[#e7e0ff] bg-[#f7f2ff] p-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a83a3]">Past</p>
                      <div className="mt-2 h-10 rounded-xl bg-[#e8dcff]" />
                    </div>
                    <div className="rounded-2xl border border-[#e7e0ff] bg-[#f7f2ff] p-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a83a3]">Now</p>
                      <div className="mt-2 h-10 rounded-xl bg-[#c7f9ff]" />
                    </div>
                    <div className="rounded-2xl border border-[#e7e0ff] bg-[#f7f2ff] p-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[#8a83a3]">Future</p>
                      <div className="mt-2 h-10 rounded-xl bg-[#ffd6e7]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <div className="rounded-3xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_18px_30px_rgba(87,61,140,0.2)]">
                <div className="flex items-center justify-between text-[#6b6286]">
                  <button className="flex flex-col items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#f2ecff]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
                        <path d="M12 4L18 7V17L12 20L6 17V7L12 4Z" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M12 4V20" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em]">Goals</span>
                  </button>
                  <button className="flex flex-col items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#f2ecff]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
                        <path d="M4 19V9" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M10 19V5" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M16 19V12" strokeWidth="1.6" strokeLinecap="round" />
                        <path d="M22 19V8" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em]">Stats</span>
                  </button>
                  <button className="flex flex-col items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-[#f2ecff]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="stroke-current">
                        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" strokeWidth="1.6" />
                        <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em]">Profile</span>
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

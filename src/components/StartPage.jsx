import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const GUIDE_STEPS = [
  { icon: '🏃', title: '모드 선택', desc: '왕복 또는 편도 코스를 선택하세요' },
  { icon: '📍', title: '출발지 설정', desc: '현위치 또는 지도에서 직접 출발지를 정하세요' },
  { icon: '🗺️', title: '경유지 추가', desc: '꼭 지나고 싶은 장소가 있다면 경유지를 추가하세요 (최대 3개)' },
  { icon: '📏', title: '거리 설정', desc: '+/- 버튼으로 원하는 거리를 조절하세요' },
  { icon: '🚀', title: '코스 생성', desc: '공원·하천길을 우선으로 안전한 경로를 추천합니다' },
  { icon: '📌', title: '저장 & 공유', desc: '마음에 드는 코스를 저장하고 다른 러너에게 추천하세요' },
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.3 + 0.1,
}));

const StartPage = ({ onStart }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showGuide, setShowGuide] = useState(() => {
    try {
      return !localStorage.getItem('roadrunner_guide_seen');
    } catch (e) { return false; }
  });

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleCloseGuide = () => {
    setShowGuide(false);
    try { localStorage.setItem('roadrunner_guide_seen', '1'); } catch (e) { }
  };

  const handleGo = () => {
    if (selectedMode) onStart(selectedMode);
  };

  return (
    <div
      className="relative flex min-h-screen w-screen flex-col items-center overflow-hidden overflow-y-auto bg-gradient-start pt-[70px] pb-[30px]"
    >
      {/* Floating Particles */}
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle pointer-events-none absolute -bottom-2.5 rounded-full"
          style={{
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.id % 3 === 0
              ? 'rgba(0,243,255,0.8)'
              : p.id % 3 === 1
                ? 'rgba(0,114,255,0.7)'
                : 'rgba(255,158,0,0.5)',
            boxShadow: `0 0 ${p.size * 3}px ${p.id % 3 === 0 ? 'rgba(0,243,255,0.4)' : p.id % 3 === 1 ? 'rgba(0,114,255,0.3)' : 'rgba(255,158,0,0.3)'}`,
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
            opacity: p.opacity,
          }}
        />
      ))}

      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -left-[15%] -top-[15%] h-[70%] w-[70%] animate-glow-pulse"
        style={{ background: 'radial-gradient(circle, rgba(0,243,255,0.1) 0%, transparent 65%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-[15%] -right-[15%] h-[70%] w-[70%] animate-glow-pulse"
        style={{ background: 'radial-gradient(circle, rgba(0,114,255,0.1) 0%, transparent 65%)', animationDelay: '2s' }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[10%] h-[300px] w-[300px] -translate-x-1/2 animate-glow-pulse"
        style={{ background: 'radial-gradient(circle, rgba(0,200,255,0.06) 0%, transparent 70%)', animationDelay: '1s', animationDuration: '3s' }}
      />

      {/* Runner track line */}
      <div
        className="absolute left-0 right-0 top-[22%] h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(0,243,255,0.15) 30%, rgba(0,243,255,0.3) 50%, rgba(0,243,255,0.15) 70%, transparent 100%)' }}
      >
        <div
          className="runner-dot absolute -top-2.5 h-1.5 w-1.5 rounded-full bg-neon-blue"
          style={{ boxShadow: '0 0 12px rgba(0,243,255,0.8), 0 0 30px rgba(0,243,255,0.4)', animation: 'runAcross 4s ease-in-out infinite' }}
        />
      </div>

      {/* Guide button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowGuide(true)}
        className="absolute right-5 top-6 z-10 h-[38px] rounded-[19px] border-white/12 bg-white/5 px-3.5 text-[0.8rem] text-white/50 transition-all duration-300"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
        }}
      >
        <span className="text-base">📖</span>
        이용 가이드
      </Button>

      {/* App title */}
      <div
        className="z-[1] mb-3 text-center transition-all duration-700 ease-out"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="mb-1 inline-block text-[2rem] animate-bounce-soft">🏃‍♂️</div>
        <div
          className="app-title mb-3 text-[2.8rem] font-black leading-tight tracking-[3px] animate-gradient-shift drop-shadow-[0_0_20px_rgba(0,200,255,0.3)]"
          style={{
            background: 'linear-gradient(135deg, #00f3ff 0%, #0072ff 40%, #a855f7 70%, #00f3ff 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          달려라 하니
        </div>
        <div
          className="text-[0.95rem] font-normal italic tracking-[2px] text-white/55 transition-opacity duration-1000 ease-out delay-500"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          ✨ 그 시절 하니도 추천 받은 코스
        </div>
      </div>

      {/* Divider */}
      <div
        className="mb-6 h-0.5 w-[60px] rounded-sm opacity-100 transition-opacity duration-1000 delay-300"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,243,255,0.5), transparent)', opacity: mounted ? 1 : 0 }}
      />

      {/* Mode cards */}
      <div
        className="z-[1] flex w-[85%] max-w-[360px] flex-col gap-4 transition-all duration-300"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedMode('roundTrip')}
          className="relative flex items-center gap-4 rounded-[20px] border bg-white/5 px-6 py-7 text-left backdrop-blur-xl transition-all duration-300"
          style={{
            borderColor: selectedMode === 'roundTrip' ? 'rgba(0,243,255,0.8)' : 'rgba(255,255,255,0.1)',
            borderWidth: selectedMode === 'roundTrip' ? 2 : 1,
            background: selectedMode === 'roundTrip' ? 'rgba(0,243,255,0.1)' : 'rgba(255,255,255,0.05)',
            boxShadow: selectedMode === 'roundTrip' ? '0 0 30px rgba(0,243,255,0.2), inset 0 0 30px rgba(0,243,255,0.05)' : '0 4px 30px rgba(0,0,0,0.2)',
            transform: selectedMode === 'roundTrip' ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-blue/10 text-[2.2rem]">🔄</div>
          <div className="flex-1">
            <div className={`mb-1 text-[1.3rem] font-extrabold transition-colors duration-300 ${selectedMode === 'roundTrip' ? 'text-neon-blue' : 'text-white'}`}>
              왕복 코스
            </div>
            <div className="text-[0.85rem] leading-snug text-white/50">출발 → 반환점 → 출발지로 돌아오기</div>
          </div>
          {selectedMode === 'roundTrip' && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-neon-blue text-sm text-white">✓</div>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedMode('oneWay')}
          className="relative flex items-center gap-4 rounded-[20px] border bg-white/5 px-6 py-7 text-left backdrop-blur-xl transition-all duration-300"
          style={{
            borderColor: selectedMode === 'oneWay' ? 'rgba(255,158,0,0.8)' : 'rgba(255,255,255,0.1)',
            borderWidth: selectedMode === 'oneWay' ? 2 : 1,
            background: selectedMode === 'oneWay' ? 'rgba(255,158,0,0.1)' : 'rgba(255,255,255,0.05)',
            boxShadow: selectedMode === 'oneWay' ? '0 0 30px rgba(255,158,0,0.2), inset 0 0 30px rgba(255,158,0,0.05)' : '0 4px 30px rgba(0,0,0,0.2)',
            transform: selectedMode === 'oneWay' ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-orange/10 text-[2.2rem]">➡️</div>
          <div className="flex-1">
            <div className={`mb-1 text-[1.3rem] font-extrabold transition-colors duration-300 ${selectedMode === 'oneWay' ? 'text-neon-orange' : 'text-white'}`}>
              편도 코스
            </div>
            <div className="text-[0.85rem] leading-snug text-white/50">출발 → 목적지까지 한 방향으로</div>
          </div>
          {selectedMode === 'oneWay' && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-neon-orange to-[#ff6600] text-sm text-white">✓</div>
          )}
        </button>
      </div>

      {/* Inline guide accordion */}
      <div className="z-[1] mt-5 w-[85%] max-w-[360px] overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-all duration-300">
        <button
          type="button"
          onClick={() => setGuideOpen(!guideOpen)}
          className="flex w-full items-center justify-between border-none bg-transparent px-[18px] py-3.5 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-[0.8rem] font-bold tracking-wide text-white/50">
            <span className="text-[0.9rem]">📖</span> 활용 가이드
          </div>
          <span
            className="inline-block text-[0.85rem] text-white/30 transition-transform duration-300"
            style={{ transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▼
          </span>
        </button>
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maxHeight: guideOpen ? 400 : 0,
            opacity: guideOpen ? 1 : 0,
            transition: 'max-height 0.35s ease, opacity 0.25s ease',
          }}
        >
          <div className="flex flex-col gap-2 px-[18px] pb-4">
            {GUIDE_STEPS.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neon-blue/10 text-[0.85rem]">
                  {step.icon}
                </div>
                <div className="flex-1 leading-snug">
                  <span className="text-[0.75rem] font-bold text-white/70">{step.title}</span>
                  <span className="ml-1.5 text-[0.7rem] text-white/35">{step.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start button */}
      <Button
        onClick={handleGo}
        disabled={!selectedMode}
        variant={selectedMode === 'oneWay' ? 'orange' : 'default'}
        className={`mt-5 w-[85%] max-w-[360px] py-5 text-[1.2rem] font-black tracking-[3px] transition-all duration-400 z-[1] ${selectedMode ? 'start-btn-pulse' : ''}`}
        style={{
          opacity: mounted ? (selectedMode ? 1 : 0.4) : 0,
          transform: mounted ? (selectedMode ? 'scale(1)' : 'scale(0.95)') : 'translateY(20px)',
        }}
      >
        {selectedMode ? '코스 설정하기 →' : '모드를 선택하세요'}
      </Button>

      {/* Bottom hint */}
      <div className="absolute bottom-[30px] z-[1] text-[0.75rem] tracking-wide text-white/20">made by JJ</div>

      {/* Guide modal — Dialog */}
      <Dialog open={showGuide} onOpenChange={(open) => !open && handleCloseGuide()}>
        <DialogContent className="max-h-[80vh] overflow-y-auto py-7 px-6 animate-[slideUp_0.3s_ease-out] data-[state=open]:animate-[fadeIn_0.25s_ease-out]">
          <DialogHeader className="mb-6 flex flex-row items-center justify-between space-y-0">
            <div>
              <DialogTitle className="mb-1">이용 가이드</DialogTitle>
              <DialogDescription>5단계로 코스를 만들어 보세요</DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseGuide}
              className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
            >
              ✕
            </Button>
          </DialogHeader>
          <div className="flex flex-col gap-0">
            {GUIDE_STEPS.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-blue/20 bg-neon-blue/10 text-[1.2rem]">
                    {step.icon}
                  </div>
                  {i < GUIDE_STEPS.length - 1 && (
                    <div className="my-1 h-5 w-0.5 bg-neon-blue/15" />
                  )}
                </div>
                <div className={i < GUIDE_STEPS.length - 1 ? 'pb-3' : ''}>
                  <div className="text-[0.95rem] font-bold leading-10 text-white">{step.title}</div>
                  <div className="text-[0.8rem] leading-snug text-white/45">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="default"
            className="mt-6 w-full py-3.5 text-base font-extrabold tracking-wide shadow-[0_0_20px_rgba(0,114,255,0.4)]"
            onClick={handleCloseGuide}
          >
            확인
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartPage;

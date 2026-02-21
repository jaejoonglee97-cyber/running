import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const ControlPanel = ({ onStart, isLoading, isReady, startMode, runMode = 'roundTrip' }) => {
  const [distanceKm, setDistanceKm] = useState(5.0);

  const adjustDistance = (delta) => {
    setDistanceKm((prev) => {
      const newVal = prev + delta;
      return Math.max(1, Math.min(42, Math.round(newVal * 10) / 10));
    });
  };

  const isOneWay = runMode === 'oneWay';
  const accentColor = isOneWay ? '#ff9e00' : '#00f3ff';

  return (
    <div
      className="glass-panel absolute bottom-3 left-3 right-3 z-[1000] rounded-[20px] px-4 py-3.5 text-white"
    >
      <div className="mb-2.5 flex items-center justify-center gap-3.5">
        <div className="shrink-0 text-[0.75rem] tracking-wide text-[var(--text-secondary)]">
          {isOneWay ? '편도' : '왕복'}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustDistance(-0.5)}
          disabled={isLoading}
          className="h-[38px] w-[38px] shrink-0 rounded-full border-white/20 bg-white/10 text-[1.3rem]"
        >
          -
        </Button>
        <div
          className="min-w-[100px] text-center text-[2.4rem] font-extrabold leading-none font-sans"
          style={{
            color: accentColor,
            textShadow: `0 0 10px ${accentColor}50`,
          }}
        >
          {distanceKm.toFixed(1)} <span className="text-[0.8rem] font-normal text-[#888]">KM</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => adjustDistance(0.5)}
          disabled={isLoading}
          className="h-[38px] w-[38px] shrink-0 rounded-full border-white/20 bg-white/10 text-[1.3rem]"
        >
          +
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: '나랑 한강 뛸래? 오늘 추천 코스야!',
                text: `오늘 ${distanceKm}km ${isOneWay ? '편도' : '왕복'} 러닝 코스를 확인해봐! 🏃`,
                url: window.location.href,
              }).then(() => {}).catch(() => {});
            } else {
              alert('공유하기를 지원하지 않는 브라우저입니다.');
            }
          }}
          disabled={isLoading}
          className="h-12 w-12 shrink-0 rounded-[14px] border-none bg-white/15 text-[1.3rem] backdrop-blur-sm transition-colors duration-300"
        >
          📤
        </Button>
        <Button
          variant={isOneWay ? 'orange' : 'default'}
          onClick={() => onStart && !isLoading && isReady && onStart(distanceKm * 1000)}
          disabled={isLoading || !isReady}
          className="flex-1 rounded-[14px] py-3.5 text-[1.05rem] font-black tracking-wider transition-all duration-300 disabled:opacity-70"
          style={{
            boxShadow: isOneWay ? '0 0 20px rgba(255,158,0,0.6)' : '0 0 20px rgba(0,114,255,0.6)',
          }}
        >
          {isLoading
            ? '경로 생성 중...'
            : !isReady && startMode === 'current'
              ? 'GPS 대기 중...'
              : isOneWay
                ? '편도 코스 생성'
                : '왕복 코스 생성'}
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;

import React, { useState } from 'react';

const ControlPanel = ({ onStart, isLoading, isReady, startMode, runMode = 'roundTrip' }) => {
    const [distanceKm, setDistanceKm] = useState(5.0);

    const adjustDistance = (delta) => {
        setDistanceKm(prev => {
            const newVal = prev + delta;
            return Math.max(1, Math.min(42, Math.round(newVal * 10) / 10));
        });
    };

    const isOneWay = runMode === 'oneWay';
    const accentColor = isOneWay ? '#ff9e00' : '#00f3ff';
    const gradientBg = isOneWay
        ? 'linear-gradient(135deg, #ff9e00 0%, #ff6600 100%)'
        : 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)';
    const shadowColor = isOneWay
        ? 'rgba(255,158,0,0.6)'
        : 'rgba(0,114,255,0.6)';

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            borderRadius: '20px',
            padding: '14px 16px',
            zIndex: 1000,
            color: 'white'
        }}>
            {/* Distance Control — inline compact */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                marginBottom: '10px'
            }}>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    letterSpacing: '1px',
                    flexShrink: 0
                }}>
                    {isOneWay ? '편도' : '왕복'}
                </div>

                <button
                    onClick={() => adjustDistance(-0.5)}
                    disabled={isLoading}
                    style={{
                        width: '38px', height: '38px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        color: 'white',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    -
                </button>

                <div style={{
                    fontSize: '2.4rem',
                    fontWeight: '800',
                    fontFamily: 'sans-serif',
                    minWidth: '100px',
                    textAlign: 'center',
                    color: accentColor,
                    textShadow: `0 0 10px ${accentColor}50`,
                    lineHeight: 1
                }}>
                    {distanceKm.toFixed(1)} <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>KM</span>
                </div>

                <button
                    onClick={() => adjustDistance(0.5)}
                    disabled={isLoading}
                    style={{
                        width: '38px', height: '38px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        color: 'white',
                        fontSize: '1.3rem',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    +
                </button>
            </div>

            {/* Action Buttons — compact row */}
            <div style={{ display: 'flex', gap: '8px' }}>
                {/* Share Button */}
                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: '나랑 한강 뛸래? 오늘 추천 코스야!',
                                text: `오늘 ${distanceKm}km ${isOneWay ? '편도' : '왕복'} 러닝 코스를 확인해봐! 🏃`,
                                url: window.location.href,
                            })
                                .then(() => console.log('Shared'))
                                .catch((error) => console.log('Share error', error));
                        } else {
                            alert("공유하기를 지원하지 않는 브라우저입니다.");
                        }
                    }}
                    disabled={isLoading}
                    style={{
                        flex: '0 0 48px',
                        height: '48px',
                        borderRadius: '14px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        fontSize: '1.3rem',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(5px)',
                        transition: '0.3s'
                    }}
                >
                    📤
                </button>

                {/* Start Button */}
                <button
                    onClick={() => onStart && !isLoading && isReady && onStart(distanceKm * 1000)}
                    disabled={isLoading || !isReady}
                    style={{
                        flex: 1,
                        padding: '14px',
                        borderRadius: '14px',
                        border: 'none',
                        fontSize: '1.05rem',
                        fontWeight: '900',
                        color: 'white',
                        letterSpacing: '2px',
                        cursor: (isLoading || !isReady) ? 'not-allowed' : 'pointer',
                        opacity: (isLoading || !isReady) ? 0.7 : 1,
                        background: gradientBg,
                        boxShadow: `0 0 20px ${shadowColor}`,
                        transition: 'all 0.3s'
                    }}
                >
                    {isLoading
                        ? '경로 생성 중...'
                        : (!isReady && startMode === 'current')
                            ? 'GPS 대기 중...'
                            : isOneWay ? '편도 코스 생성' : '왕복 코스 생성'}
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;

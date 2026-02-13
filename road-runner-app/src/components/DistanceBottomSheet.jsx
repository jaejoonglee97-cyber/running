import React, { useState } from 'react';

const ControlPanel = ({ onStart, isLoading, isReady, startMode }) => {
    const [distanceKm, setDistanceKm] = useState(5.0); // Default 5km

    const adjustDistance = (delta) => {
        setDistanceKm(prev => {
            const newVal = prev + delta;
            return Math.max(3, Math.min(21, Math.round(newVal * 10) / 10)); // Clamp 3-21, keep 1 decimal
        });
    };

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            bottom: '30px',
            left: '20px',
            right: '20px',
            borderRadius: '24px',
            padding: '24px',
            zIndex: 1000,
            color: 'white'
        }}>
            {/* Distance Control */}
            <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px', letterSpacing: '1px' }}>TARGET DISTANCE</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                    <button
                        onClick={() => adjustDistance(-0.5)}
                        disabled={isLoading}
                        style={{
                            width: '50px', height: '50px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        -
                    </button>

                    <div style={{ fontSize: '3.5rem', fontWeight: '800', fontFamily: 'sans-serif', minWidth: '140px', textAlign: 'center' }} className="neon-text-blue">
                        {distanceKm.toFixed(1)} <span style={{ fontSize: '1rem', color: '#888', fontWeight: 'normal' }}>KM</span>
                    </div>

                    <button
                        onClick={() => adjustDistance(0.5)}
                        disabled={isLoading}
                        style={{
                            width: '50px', height: '50px',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Action Buttons Container */}
            <div style={{ display: 'flex', gap: '10px' }}>
                {/* Share Button */}
                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: '나랑 한강 뛸래? 오늘 추천 코스야!',
                                text: `이재중이 추천하는 오늘 ${distanceKm}km 러닝 코스를 확인해봐! 🏃`,
                                url: window.location.href,
                            })
                                .then(() => console.log('Successful share'))
                                .catch((error) => console.log('Error sharing', error));
                        } else {
                            alert("공유하기를 지원하지 않는 브라우저입니다. URL을 복사해주세요: " + window.location.href);
                        }
                    }}
                    disabled={isLoading}
                    style={{
                        flex: '0 0 60px',
                        height: '60px',
                        borderRadius: '16px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        fontSize: '1.5rem',
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
                    className="neon-button"
                    onClick={() => onStart && !isLoading && isReady && onStart(distanceKm * 1000)}
                    disabled={isLoading || !isReady}
                    style={{
                        flex: 1,
                        padding: '18px',
                        borderRadius: '16px',
                        border: 'none',
                        fontSize: '1.2rem',
                        fontWeight: '900',
                        color: 'white',
                        letterSpacing: '2px',
                        cursor: (isLoading || !isReady) ? 'not-allowed' : 'pointer',
                        opacity: (isLoading || !isReady) ? 0.7 : 1,
                        transition: 'all 0.3s'
                    }}
                >
                    {isLoading ? 'CALCULATING...' : (!isReady && startMode === 'current' ? 'WAITING FOR GPS...' : 'START RUN')}
                </button>
            </div>
        </div>
    );
};

export default ControlPanel;

import React, { useState } from 'react';

const StartPage = ({ onStart }) => {
    const [selectedMode, setSelectedMode] = useState(null);

    const handleGo = () => {
        if (selectedMode) {
            onStart(selectedMode);
        }
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(180deg, #0a0a1a 0%, #121225 40%, #1a1a3e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Ambient glow effects */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                left: '-10%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(0,243,255,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-10%',
                width: '60%',
                height: '60%',
                background: 'radial-gradient(circle, rgba(0,114,255,0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* App Title */}
            <div style={{ textAlign: 'center', marginBottom: '60px', zIndex: 1 }}>
                <div style={{
                    fontSize: '3.5rem',
                    fontWeight: '900',
                    letterSpacing: '4px',
                    background: 'linear-gradient(135deg, #00f3ff 0%, #0072ff 50%, #00f3ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    marginBottom: '8px'
                }}>
                    🏃 RUN
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '3px',
                    fontWeight: '300'
                }}>
                    CHOOSE YOUR PATH
                </div>
            </div>

            {/* Mode Selection Cards */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                width: '85%',
                maxWidth: '360px',
                zIndex: 1
            }}>
                {/* Round Trip Card */}
                <button
                    onClick={() => setSelectedMode('roundTrip')}
                    style={{
                        position: 'relative',
                        padding: '28px 24px',
                        borderRadius: '20px',
                        border: selectedMode === 'roundTrip'
                            ? '2px solid rgba(0,243,255,0.8)'
                            : '1px solid rgba(255,255,255,0.1)',
                        background: selectedMode === 'roundTrip'
                            ? 'rgba(0,243,255,0.1)'
                            : 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(12px)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedMode === 'roundTrip'
                            ? '0 0 30px rgba(0,243,255,0.2), inset 0 0 30px rgba(0,243,255,0.05)'
                            : '0 4px 30px rgba(0,0,0,0.2)',
                        transform: selectedMode === 'roundTrip' ? 'scale(1.02)' : 'scale(1)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            fontSize: '2.2rem',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '16px',
                            background: 'rgba(0,243,255,0.1)',
                        }}>
                            🔄
                        </div>
                        <div>
                            <div style={{
                                fontSize: '1.3rem',
                                fontWeight: '800',
                                color: selectedMode === 'roundTrip' ? '#00f3ff' : '#ffffff',
                                marginBottom: '4px',
                                transition: 'color 0.3s'
                            }}>
                                왕복 코스
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: '1.4'
                            }}>
                                출발 → 반환점 → 출발지로 돌아오기
                            </div>
                        </div>
                    </div>
                    {/* Selection indicator */}
                    {selectedMode === 'roundTrip' && (
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #00f3ff, #0072ff)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: 'white'
                        }}>
                            ✓
                        </div>
                    )}
                </button>

                {/* One Way Card */}
                <button
                    onClick={() => setSelectedMode('oneWay')}
                    style={{
                        position: 'relative',
                        padding: '28px 24px',
                        borderRadius: '20px',
                        border: selectedMode === 'oneWay'
                            ? '2px solid rgba(255,158,0,0.8)'
                            : '1px solid rgba(255,255,255,0.1)',
                        background: selectedMode === 'oneWay'
                            ? 'rgba(255,158,0,0.1)'
                            : 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(12px)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedMode === 'oneWay'
                            ? '0 0 30px rgba(255,158,0,0.2), inset 0 0 30px rgba(255,158,0,0.05)'
                            : '0 4px 30px rgba(0,0,0,0.2)',
                        transform: selectedMode === 'oneWay' ? 'scale(1.02)' : 'scale(1)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            fontSize: '2.2rem',
                            width: '56px',
                            height: '56px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '16px',
                            background: 'rgba(255,158,0,0.1)',
                        }}>
                            ➡️
                        </div>
                        <div>
                            <div style={{
                                fontSize: '1.3rem',
                                fontWeight: '800',
                                color: selectedMode === 'oneWay' ? '#ff9e00' : '#ffffff',
                                marginBottom: '4px',
                                transition: 'color 0.3s'
                            }}>
                                편도 코스
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: '1.4'
                            }}>
                                출발 → 목적지까지 한 방향으로
                            </div>
                        </div>
                    </div>
                    {/* Selection indicator */}
                    {selectedMode === 'oneWay' && (
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff9e00, #ff6600)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            color: 'white'
                        }}>
                            ✓
                        </div>
                    )}
                </button>
            </div>

            {/* Start Button */}
            <button
                onClick={handleGo}
                disabled={!selectedMode}
                style={{
                    marginTop: '40px',
                    width: '85%',
                    maxWidth: '360px',
                    padding: '20px',
                    borderRadius: '18px',
                    border: 'none',
                    fontSize: '1.2rem',
                    fontWeight: '900',
                    letterSpacing: '3px',
                    color: 'white',
                    cursor: selectedMode ? 'pointer' : 'not-allowed',
                    opacity: selectedMode ? 1 : 0.4,
                    background: selectedMode === 'oneWay'
                        ? 'linear-gradient(135deg, #ff9e00 0%, #ff6600 100%)'
                        : 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                    boxShadow: selectedMode
                        ? selectedMode === 'oneWay'
                            ? '0 0 30px rgba(255,158,0,0.5)'
                            : '0 0 30px rgba(0,114,255,0.5)'
                        : 'none',
                    transition: 'all 0.4s ease',
                    transform: selectedMode ? 'scale(1)' : 'scale(0.95)',
                    zIndex: 1
                }}
            >
                {selectedMode ? '코스 설정하기 →' : '모드를 선택하세요'}
            </button>

            {/* Bottom hint */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                color: 'rgba(255,255,255,0.2)',
                fontSize: '0.75rem',
                letterSpacing: '1px',
                zIndex: 1
            }}>
                ROAD RUNNER v1.0
            </div>
        </div>
    );
};

export default StartPage;

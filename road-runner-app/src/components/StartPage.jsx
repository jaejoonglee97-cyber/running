import React, { useState } from 'react';

const GUIDE_STEPS = [
    { icon: '🏃', title: '모드 선택', desc: '왕복 또는 편도 코스를 선택하세요' },
    { icon: '📍', title: '출발지 설정', desc: '현위치 또는 지도에서 직접 출발지를 정하세요' },
    { icon: '🗺️', title: '경유지 추가', desc: '꼭 지나고 싶은 장소가 있다면 경유지를 추가하세요 (최대 3개)' },
    { icon: '📏', title: '거리 설정', desc: '+/- 버튼으로 원하는 거리를 조절하세요' },
    { icon: '🚀', title: '코스 생성', desc: '공원·하천길을 우선으로 안전한 경로를 추천합니다' },
    { icon: '📌', title: '저장 & 공유', desc: '마음에 드는 코스를 저장하고 다른 러너에게 추천하세요' },
];

const StartPage = ({ onStart }) => {
    const [selectedMode, setSelectedMode] = useState(null);
    const [guideOpen, setGuideOpen] = useState(false);
    // 첫 방문 시 자동으로 가이드 표시
    const [showGuide, setShowGuide] = useState(() => {
        try {
            return !localStorage.getItem('roadrunner_guide_seen');
        } catch (e) { return false; }
    });

    const handleCloseGuide = () => {
        setShowGuide(false);
        try { localStorage.setItem('roadrunner_guide_seen', '1'); } catch (e) { }
    };

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
            justifyContent: 'flex-start',
            paddingTop: '80px',
            paddingBottom: '30px',
            overflowY: 'auto',
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

            {/* Guide Button (Top Right) */}
            <button
                onClick={() => setShowGuide(true)}
                style={{
                    position: 'absolute',
                    top: '50px',
                    right: '20px',
                    zIndex: 10,
                    height: '38px',
                    borderRadius: '19px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 14px',
                    transition: 'all 0.3s'
                }}
            >
                <span style={{ fontSize: '1rem' }}>📖</span>
                이용 가이드
            </button>

            {/* App Title */}
            <div style={{ textAlign: 'center', marginBottom: '30px', zIndex: 1 }}>
                <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    letterSpacing: '2px',
                    background: 'linear-gradient(135deg, #00f3ff 0%, #0072ff 50%, #00f3ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    marginBottom: '8px'
                }}>
                    🏃 달려라 하니
                </div>
                <div style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '3px',
                    fontWeight: '300'
                }}>
                    코스를 추천받아 보세요
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

            {/* Inline Guide — 활용 가이드 (접기/펼치기) */}
            <div style={{
                width: '85%',
                maxWidth: '360px',
                marginTop: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.03)',
                overflow: 'hidden',
                zIndex: 1,
                transition: 'all 0.3s ease'
            }}>
                {/* 가이드 헤더 (클릭 시 펼치기/접기) */}
                <button
                    onClick={() => setGuideOpen(!guideOpen)}
                    style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <div style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <span style={{ fontSize: '0.9rem' }}>📖</span> 활용 가이드
                    </div>
                    <span style={{
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.3)',
                        transition: 'transform 0.3s ease',
                        transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        display: 'inline-block'
                    }}>
                        ▼
                    </span>
                </button>

                {/* 가이드 내용 (접기/펼치기) */}
                <div style={{
                    maxHeight: guideOpen ? '400px' : '0',
                    opacity: guideOpen ? 1 : 0,
                    transition: 'max-height 0.35s ease, opacity 0.25s ease',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        padding: '0 18px 16px'
                    }}>
                        {GUIDE_STEPS.map((step, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: 'rgba(0,243,255,0.08)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.85rem',
                                    flexShrink: 0
                                }}>
                                    {step.icon}
                                </div>
                                <div style={{ flex: 1, lineHeight: '1.3' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: 'rgba(255,255,255,0.7)'
                                    }}>
                                        {step.title}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        color: 'rgba(255,255,255,0.35)',
                                        marginLeft: '6px'
                                    }}>
                                        {step.desc}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <button
                onClick={handleGo}
                disabled={!selectedMode}
                style={{
                    marginTop: '20px',
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
                made by JJ
            </div>

            {/* ==================== GUIDE MODAL ==================== */}
            {showGuide && (
                <div
                    onClick={() => handleCloseGuide()}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.25s ease-out'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '88%',
                            maxWidth: '380px',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            borderRadius: '24px',
                            background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            padding: '28px 24px',
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {/* Guide Header */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: '1.3rem',
                                    fontWeight: '800',
                                    color: '#fff',
                                    marginBottom: '4px'
                                }}>
                                    이용 가이드
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'rgba(255,255,255,0.4)'
                                }}>
                                    5단계로 코스를 만들어 보세요
                                </div>
                            </div>
                            <button
                                onClick={() => handleCloseGuide()}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Guide Steps */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {GUIDE_STEPS.map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                    {/* Timeline */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        flexShrink: 0
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: 'rgba(0,243,255,0.1)',
                                            border: '1px solid rgba(0,243,255,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem'
                                        }}>
                                            {step.icon}
                                        </div>
                                        {i < GUIDE_STEPS.length - 1 && (
                                            <div style={{
                                                width: '2px',
                                                height: '20px',
                                                background: 'rgba(0,243,255,0.15)',
                                                margin: '4px 0'
                                            }} />
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div style={{ paddingBottom: i < GUIDE_STEPS.length - 1 ? '12px' : '0' }}>
                                        <div style={{
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            color: '#fff',
                                            marginBottom: '2px',
                                            lineHeight: '40px'
                                        }}>
                                            {step.title}
                                        </div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'rgba(255,255,255,0.45)',
                                            lineHeight: '1.4'
                                        }}>
                                            {step.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => handleCloseGuide()}
                            style={{
                                marginTop: '24px',
                                width: '100%',
                                padding: '14px',
                                borderRadius: '14px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '800',
                                letterSpacing: '1px',
                                cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(0,114,255,0.4)'
                            }}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
};

export default StartPage;

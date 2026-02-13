
import React, { useState } from 'react';

const DistanceBottomSheet = ({ onDistanceChange, onStart, isLoading }) => {
    const [distance, setDistance] = useState(3000); // Default 3km (3000m)

    const handleSliderChange = (e) => {
        const val = parseInt(e.target.value, 10);
        setDistance(val);
        if (onDistanceChange) onDistanceChange(val);
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'white',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '20px',
            boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000,
            boxSizing: 'border-box',
            transition: 'transform 0.3s ease-in-out'
        }}>
            <div style={{ width: '40px', height: '5px', background: '#ccc', borderRadius: '3px', margin: '0 auto 20px' }}></div>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>목표 거리 설정</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007AFF' }}>
                    {(distance / 1000).toFixed(1)} km
                </span>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>왕복 기준</span>
            </div>

            <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={distance}
                onChange={handleSliderChange}
                disabled={isLoading}
                style={{ width: '100%', marginBottom: '20px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1 }}
            />

            <button
                onClick={() => onStart && !isLoading && onStart(distance)}
                disabled={isLoading}
                style={{
                    width: '100%',
                    padding: '15px',
                    background: isLoading ? '#ccc' : '#007AFF', // Premium blue or disabled gray
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'background 0.3s'
                }}
            >
                {isLoading ? (
                    <div className="spinner" style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderRadius: '50%',
                        borderTopColor: '#fff',
                        animation: 'spin 1s ease-in-out infinite'
                    }}></div>
                ) : (
                    '가상의 반환점 생성하기'
                )}
            </button>

            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>

            {/* Guide for background assets */}
            <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#999', textAlign: 'center' }}>
                * 배경 및 아이콘은 /src/assets 폴더를 참고하세요.
            </div>
        </div>
    );
};

export default DistanceBottomSheet;

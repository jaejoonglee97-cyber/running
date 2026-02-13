import React, { useState, useEffect } from 'react';
import FullMap from './FullMap';
import ControlPanel from './DistanceBottomSheet';
import { CourseManager } from '../logic/courseManager';

const MainPage = ({ runMode = 'roundTrip', onBack }) => {
    const [courseData, setCourseData] = useState({
        startPoint: null,
        turnaroundPoint: null,
        routePath: []
    });
    const [isLoading, setIsLoading] = useState(false);

    // Default to 'custom' (Map Selection)
    const [startMode, setStartMode] = useState('custom'); // 'current' | 'custom'
    const [currentMapCenter, setCurrentMapCenter] = useState(null);
    const [gpsLocation, setGpsLocation] = useState(null);

    const courseManager = new CourseManager();

    // Initialize GPS
    useEffect(() => {
        const initGps = async () => {
            try {
                const pos = await courseManager.gps.getCurrentPosition();
                setGpsLocation(pos);
                console.log("GPS Initialized:", pos);
            } catch (e) {
                console.warn("GPS Initialization failed (passive):", e);
            }
        };
        initGps();
    }, []);

    const handleModeChange = (mode) => {
        setStartMode(mode);
        if (mode === 'current' && !gpsLocation) {
            courseManager.gps.getCurrentPosition().then(setGpsLocation).catch(e => {
                alert("GPS 위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
            });
        }
    };

    const handleCenterChange = (latlng) => {
        setCurrentMapCenter(latlng);
    };

    const handleCreateCourse = async (targetDistance) => {
        setIsLoading(true);

        try {
            let start;
            if (startMode === 'current') {
                start = gpsLocation;
                if (!start) {
                    start = await courseManager.gps.getCurrentPosition();
                    setGpsLocation(start);
                }
            } else {
                if (!currentMapCenter) {
                    alert("지도를 움직여 시작 위치를 설정해주세요.");
                    setIsLoading(false);
                    return;
                }
                start = { lat: currentMapCenter.lat, lng: currentMapCenter.lng };
            }

            let result;
            if (runMode === 'oneWay') {
                // One-way mode
                result = await courseManager.generateOneWayCourse(start, targetDistance);
            } else {
                // Round trip mode (default)
                result = await courseManager.generateCourseFromPoint(start, targetDistance);
            }

            setCourseData({
                startPoint: result.startPoint,
                turnaroundPoint: result.turnaroundPoint || result.endPoint,
                routePath: result.routePath
            });
        } catch (error) {
            console.error("Failed to generate course:", error);
            alert("경로 생성에 실패했습니다.\n\n가능한 원인:\n1. OSRM 서버 응답 지연 (잠시 후 다시 시도)\n2. 시작점 주변에 인식 가능한 도로 없음\n3. 네트워크 연결 불안정");
        } finally {
            setIsLoading(false);
        }
    };

    const isReady = startMode === 'custom' || (startMode === 'current' && !!gpsLocation);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#121212' }}>
            {/* Back Button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    top: '50px',
                    left: '16px',
                    zIndex: 1600,
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: 'rgba(20,20,20,0.7)',
                    backdropFilter: 'blur(12px)',
                    color: 'white',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                ←
            </button>

            {/* Mode Badge (shows current run type) */}
            <div style={{
                position: 'absolute',
                top: '52px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '20px',
                background: 'rgba(20,20,20,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                <span style={{ fontSize: '1rem' }}>
                    {runMode === 'oneWay' ? '➡️' : '🔄'}
                </span>
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                    letterSpacing: '1px'
                }}>
                    {runMode === 'oneWay' ? '편도' : '왕복'}
                </span>
            </div>

            {/* Map Component */}
            <FullMap
                startPoint={courseData.startPoint}
                turnaroundPoint={courseData.turnaroundPoint}
                routePath={courseData.routePath}
                isLoading={isLoading}
                isCustomMode={startMode === 'custom'}
                onModeChange={handleModeChange}
                onCenterChange={handleCenterChange}
                runMode={runMode}
            />

            {/* Bottom Control Panel */}
            <ControlPanel
                onStart={handleCreateCourse}
                isLoading={isLoading}
                isReady={isReady}
                startMode={startMode}
                runMode={runMode}
            />
        </div>
    );
};

export default MainPage;

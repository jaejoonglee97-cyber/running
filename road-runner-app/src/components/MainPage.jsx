import React, { useState, useEffect } from 'react';
import FullMap from './FullMap';
import ControlPanel from './DistanceBottomSheet'; // File name kept, component renamed
import { CourseManager } from '../logic/courseManager';

const MainPage = () => {
    const [courseData, setCourseData] = useState({
        startPoint: null,
        turnaroundPoint: null,
        routePath: []
    });
    const [isLoading, setIsLoading] = useState(false);

    // Default to 'custom' (Map Selection) as requested for stability
    const [startMode, setStartMode] = useState('custom'); // 'current' | 'custom'
    const [currentMapCenter, setCurrentMapCenter] = useState(null);
    const [gpsLocation, setGpsLocation] = useState(null);

    // Instantiate logic manager
    // Note: We use useMemo or assume it's cheap to create. 
    // Better to keep it consistent or use a ref if it holds state, but here it's stateless mostly.
    const courseManager = new CourseManager();

    // 1. Initialize GPS on tracker start (Best Effort)
    useEffect(() => {
        const initGps = async () => {
            try {
                const pos = await courseManager.gps.getCurrentPosition();
                setGpsLocation(pos);
                console.log("GPS Initialized:", pos);
            } catch (e) {
                console.warn("GPS Initialization failed (passive):", e);
                // System will pop up permission dialog naturally if not denied previously
            }
        };
        initGps();
    }, []);

    const handleModeChange = (mode) => {
        setStartMode(mode);
        // If switching to current and we don't have GPS, try again
        if (mode === 'current' && !gpsLocation) {
            courseManager.gps.getCurrentPosition().then(setGpsLocation).catch(e => {
                alert("GPS 위 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
            });
        }
    };

    // Track map center for Custom Mode
    const handleCenterChange = (latlng) => {
        setCurrentMapCenter(latlng);
    };

    const handleCreateCourse = async (targetDistance) => {
        setIsLoading(true);

        try {
            let result;
            if (startMode === 'current') {
                // GPS Mode: Use pre-fetched or fetch now
                let start = gpsLocation;
                if (!start) {
                    start = await courseManager.gps.getCurrentPosition();
                    setGpsLocation(start);
                }
                result = await courseManager.generateCourseFromPoint(start, targetDistance);
            } else {
                // Map Center based
                if (!currentMapCenter) {
                    // Should be rare if map is loaded, but safety check
                    alert("지도를 움직여 시작 위치를 설정해주세요.");
                    setIsLoading(false);
                    return;
                }
                const start = { lat: currentMapCenter.lat, lng: currentMapCenter.lng };
                result = await courseManager.generateCourseFromPoint(start, targetDistance);
            }

            // Bind API response data to state for Map
            setCourseData({
                startPoint: result.startPoint,
                turnaroundPoint: result.turnaroundPoint,
                routePath: result.routePath
            });

            const fetchRouteWithRetry = async (url) => {
                // ... logic is inside osrm.js now
            }

            // ... inside handleCreateCourse catch block:
        } catch (error) {
            console.error("Failed to generate course:", error);
            alert("전체 경로 생성에 실패했습니다.\n\n가능한 원인:\n1. OSRM 서버 응답 지연 (잠시 후 다시 시도)\n2. 시작점 주변에 인식 가능한 도로 없음\n3. 네트워크 연결 불안정");
        } finally {
            setIsLoading(false);
        }
    };

    // Determine if we can start
    const isReady = startMode === 'custom' || (startMode === 'current' && !!gpsLocation);

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#121212' }}>
            {/* Map Component */}
            <FullMap
                startPoint={courseData.startPoint}
                turnaroundPoint={courseData.turnaroundPoint}
                routePath={courseData.routePath}
                isLoading={isLoading}
                isCustomMode={startMode === 'custom'}
                onModeChange={handleModeChange}
                onCenterChange={handleCenterChange}
            />

            {/* Bottom Control Panel */}
            <ControlPanel
                onStart={handleCreateCourse}
                isLoading={isLoading}
                isReady={isReady}
                startMode={startMode}
            />
        </div>
    );
};

export default MainPage;

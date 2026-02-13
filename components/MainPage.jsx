
import React, { useState } from 'react';
import FullMap from './FullMap';
import DistanceBottomSheet from './DistanceBottomSheet';
import { CourseManager } from '../logic/courseManager';

const MainPage = () => {
    const [courseData, setCourseData] = useState({
        startPoint: null,
        turnaroundPoint: null,
        routePath: []
    });
    const [isLoading, setIsLoading] = useState(false);

    // Instantiate logic manager
    const courseManager = new CourseManager();

    const handleCreateCourse = async (targetDistance) => {
        setIsLoading(true);
        // Reset previous error/toast if any (logic omitted for brevity)

        try {
            // Trigger the sequence: GPS -> Turnaround -> API
            const result = await courseManager.generateCourse(targetDistance);

            // 2. Bind API response data to state for Map
            setCourseData({
                startPoint: result.startPoint,
                turnaroundPoint: result.turnaroundPoint,
                routePath: result.routePath
            });

        } catch (error) {
            console.error("Failed to generate course:", error);
            // 3. Error Handling
            alert("위치 권한을 확인하거나 다시 시도해주세요.\n(GPS 수신 실패 또는 API 오류)");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* Map Component with Data Binding & Loading State */}
            <FullMap
                startPoint={courseData.startPoint}
                turnaroundPoint={courseData.turnaroundPoint}
                routePath={courseData.routePath}
                isLoading={isLoading}
            />

            {/* Bottom Sheet with Trigger */}
            <DistanceBottomSheet
                onStart={handleCreateCourse}
                isLoading={isLoading}
            />
        </div>
    );
};

export default MainPage;

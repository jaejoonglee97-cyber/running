import React, { useState, useEffect } from 'react';
import { fetchSharedCourses, fetchCourseDetail, likeCourse } from '../logic/sheetsApi';
import { PRESET_AREAS, PRESET_COURSES } from '../logic/presetCourses';
import { CourseManager } from '../logic/courseManager';

const SharedCoursesPanel = ({ isOpen, onClose, onLoadCourse }) => {
    const [activeTab, setActiveTab] = useState('preset'); // 'preset' | 'shared'
    const [selectedArea, setSelectedArea] = useState('gangbuk');
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCourseId, setLoadingCourseId] = useState(null);
    const [likedIds, setLikedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('roadrunner_liked') || '[]');
        } catch { return []; }
    });

    const courseManager = new CourseManager();

    useEffect(() => {
        if (isOpen && activeTab === 'shared') loadCourses();
    }, [isOpen, activeTab]);

    const loadCourses = async () => {
        setIsLoading(true);
        try {
            const data = await fetchSharedCourses();
            setCourses(data);
        } catch (err) {
            console.error('코스 목록 로딩 실패:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // 프리셋 코스 로드 (OSRM으로 경로 생성)
    const handleLoadPreset = async (preset) => {
        setLoadingCourseId(preset.id);
        try {
            const result = await courseManager.generatePresetCourse(preset);
            onLoadCourse({
                startLat: result.startPoint.lat,
                startLng: result.startPoint.lng,
                endLat: result.turnaroundPoint.lat,
                endLng: result.turnaroundPoint.lng,
                routePath: result.routePath,
                courseName: preset.courseName,
                title: preset.courseName,
                subtitle: preset.subtitle,
                tags: preset.tags,
                distanceKm: preset.distanceKm,
                runMode: preset.runMode
            });
            onClose();
        } catch (err) {
            console.error('추천 코스 생성 실패:', err);
            alert('경로 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setLoadingCourseId(null);
        }
    };

    // 공유 코스 로드
    const handleLoadCourse = async (courseId) => {
        setLoadingCourseId(courseId);
        try {
            const detail = await fetchCourseDetail(courseId);
            if (detail) {
                if (typeof detail.routePath === 'string') {
                    detail.routePath = JSON.parse(detail.routePath);
                }
                onLoadCourse(detail);
                onClose();
            }
        } catch (err) {
            console.error('코스 불러오기 실패:', err);
            alert('코스를 불러오는데 실패했습니다.');
        } finally {
            setLoadingCourseId(null);
        }
    };

    const handleLike = async (e, courseId) => {
        e.stopPropagation();
        if (likedIds.includes(courseId)) return;

        try {
            const result = await likeCourse(courseId);
            setCourses(prev => prev.map(c =>
                String(c.id) === String(courseId)
                    ? { ...c, likes: result.likes }
                    : c
            ));
            const newLiked = [...likedIds, courseId];
            setLikedIds(newLiked);
            localStorage.setItem('roadrunner_liked', JSON.stringify(newLiked));
        } catch (err) {
            console.error('좋아요 실패:', err);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    const filteredPresets = PRESET_COURSES.filter(c => c.area === selectedArea);
    const currentArea = PRESET_AREAS.find(a => a.id === selectedArea);

    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(10px)',
                zIndex: 2500,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                animation: 'fadeIn 0.25s ease-out'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    maxHeight: '85vh',
                    borderRadius: '24px 24px 0 0',
                    background: 'linear-gradient(180deg, #1a1a2e 0%, #12121f 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderBottom: 'none',
                    boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideUp 0.35s ease-out'
                }}
            >
                {/* Handle bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '12px 0 8px'
                }}>
                    <div style={{
                        width: '40px', height: '4px',
                        borderRadius: '2px',
                        background: 'rgba(255,255,255,0.2)'
                    }} />
                </div>

                {/* Header */}
                <div style={{
                    padding: '8px 24px 12px',
                }}>
                    <div style={{
                        fontSize: '1.3rem',
                        fontWeight: '800',
                        color: '#fff',
                        marginBottom: '4px'
                    }}>
                        러닝 코스 🔥
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.4)',
                    }}>
                        서울 인기 코스를 달려보세요
                    </div>
                </div>

                {/* Tab Switcher */}
                <div style={{
                    display: 'flex',
                    padding: '0 20px',
                    gap: '4px',
                    marginBottom: '12px'
                }}>
                    <button
                        onClick={() => setActiveTab('preset')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'preset'
                                ? 'rgba(0,243,255,0.15)'
                                : 'rgba(255,255,255,0.04)',
                            color: activeTab === 'preset' ? '#00f3ff' : 'rgba(255,255,255,0.4)',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: activeTab === 'preset'
                                ? '1px solid rgba(0,243,255,0.3)'
                                : '1px solid transparent'
                        }}
                    >
                        📍 추천 코스
                    </button>
                    <button
                        onClick={() => setActiveTab('shared')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === 'shared'
                                ? 'rgba(255,158,0,0.15)'
                                : 'rgba(255,255,255,0.04)',
                            color: activeTab === 'shared' ? '#ff9e00' : 'rgba(255,255,255,0.4)',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            outline: activeTab === 'shared'
                                ? '1px solid rgba(255,158,0,0.3)'
                                : '1px solid transparent'
                        }}
                    >
                        🏃 공유 코스
                    </button>
                </div>

                {/* Content Area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 16px 24px',
                    scrollbarWidth: 'none'
                }}>
                    {activeTab === 'preset' ? (
                        /* ===== 추천 코스 탭 ===== */
                        <>
                            {/* Area Selector */}
                            <div style={{
                                display: 'flex',
                                gap: '6px',
                                marginBottom: '14px',
                                overflowX: 'auto',
                                scrollbarWidth: 'none',
                                padding: '2px 0'
                            }}>
                                {PRESET_AREAS.map(area => (
                                    <button
                                        key={area.id}
                                        onClick={() => setSelectedArea(area.id)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: selectedArea === area.id
                                                ? '1px solid rgba(0,243,255,0.4)'
                                                : '1px solid rgba(255,255,255,0.08)',
                                            background: selectedArea === area.id
                                                ? 'rgba(0,243,255,0.12)'
                                                : 'rgba(255,255,255,0.04)',
                                            color: selectedArea === area.id
                                                ? '#00f3ff'
                                                : 'rgba(255,255,255,0.5)',
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s',
                                            flexShrink: 0
                                        }}
                                    >
                                        {area.emoji} {area.name}
                                    </button>
                                ))}
                            </div>

                            {/* Area Title */}
                            <div style={{
                                padding: '0 4px 10px',
                                fontSize: '0.78rem',
                                color: 'rgba(255,255,255,0.35)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <span style={{
                                    fontSize: '1.1rem'
                                }}>{currentArea?.emoji}</span>
                                {currentArea?.name} · {currentArea?.subtitle} · {filteredPresets.length}개 코스
                            </div>

                            {/* Preset Course Cards */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                {filteredPresets.map(preset => {
                                    const isThisLoading = loadingCourseId === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => handleLoadPreset(preset)}
                                            disabled={!!loadingCourseId}
                                            style={{
                                                width: '100%',
                                                padding: '16px 18px',
                                                borderRadius: '16px',
                                                border: isThisLoading
                                                    ? '1px solid rgba(0,243,255,0.3)'
                                                    : '1px solid rgba(255,255,255,0.08)',
                                                background: isThisLoading
                                                    ? 'rgba(0,243,255,0.1)'
                                                    : 'rgba(255,255,255,0.04)',
                                                cursor: loadingCourseId ? 'wait' : 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s',
                                                opacity: loadingCourseId && !isThisLoading ? 0.5 : 1
                                            }}
                                        >
                                            {/* Course Name + Distance */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '6px'
                                            }}>
                                                <div style={{
                                                    fontSize: '1rem',
                                                    fontWeight: '800',
                                                    color: '#fff',
                                                    flex: 1
                                                }}>
                                                    {preset.courseName}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: '800',
                                                    color: '#00f3ff',
                                                    flexShrink: 0,
                                                    padding: '2px 10px',
                                                    borderRadius: '10px',
                                                    background: 'rgba(0,243,255,0.1)'
                                                }}>
                                                    {preset.distanceKm}km
                                                </div>
                                            </div>

                                            {/* Route Description */}
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'rgba(255,255,255,0.4)',
                                                marginBottom: '8px',
                                                lineHeight: '1.4'
                                            }}>
                                                {preset.subtitle}
                                            </div>

                                            {/* Tags */}
                                            <div style={{
                                                display: 'flex',
                                                gap: '4px',
                                                flexWrap: 'wrap'
                                            }}>
                                                {preset.tags.map((tag, i) => (
                                                    <span key={i} style={{
                                                        fontSize: '0.65rem',
                                                        fontWeight: '600',
                                                        padding: '3px 8px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,243,255,0.1)',
                                                        color: '#00f3ff'
                                                    }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {isThisLoading && (
                                                <div style={{
                                                    marginTop: '10px',
                                                    textAlign: 'center',
                                                    fontSize: '0.78rem',
                                                    color: '#00f3ff',
                                                    animation: 'pulse 1.5s infinite'
                                                }}>
                                                    🗺️ 경로 생성 중...
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        /* ===== 공유 코스 탭 ===== */
                        <>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                marginBottom: '10px'
                            }}>
                                <button
                                    onClick={loadCourses}
                                    disabled={isLoading}
                                    style={{
                                        width: '36px', height: '36px',
                                        borderRadius: '50%',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'transform 0.3s',
                                        transform: isLoading ? 'rotate(360deg)' : 'none'
                                    }}
                                >
                                    🔄
                                </button>
                            </div>

                            {isLoading && courses.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: 'rgba(255,255,255,0.3)',
                                    fontSize: '0.9rem'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏃‍♂️</div>
                                    불러오는 중...
                                </div>
                            ) : courses.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: 'rgba(255,255,255,0.3)',
                                    fontSize: '0.9rem'
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🏜️</div>
                                    아직 공유된 코스가 없어요<br />
                                    첫 번째 코스를 공유해 보세요!
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                }}>
                                    {courses.map((course) => {
                                        const isLiked = likedIds.includes(String(course.id));
                                        const isThisLoading = loadingCourseId === String(course.id);
                                        const tags = course.tags
                                            ? (typeof course.tags === 'string' ? course.tags.split(',') : course.tags)
                                            : [];

                                        return (
                                            <button
                                                key={course.id}
                                                onClick={() => handleLoadCourse(String(course.id))}
                                                disabled={!!loadingCourseId}
                                                style={{
                                                    width: '100%',
                                                    padding: '16px 18px',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    background: isThisLoading
                                                        ? 'rgba(0,243,255,0.1)'
                                                        : 'rgba(255,255,255,0.04)',
                                                    cursor: loadingCourseId ? 'wait' : 'pointer',
                                                    textAlign: 'left',
                                                    transition: 'all 0.2s',
                                                    opacity: loadingCourseId && !isThisLoading ? 0.5 : 1
                                                }}
                                            >
                                                {/* Top row: name + likes */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '6px'
                                                }}>
                                                    <div style={{
                                                        fontSize: '1rem',
                                                        fontWeight: '800',
                                                        color: '#fff',
                                                        flex: 1
                                                    }}>
                                                        {course.courseName || course.title}
                                                    </div>
                                                    <div
                                                        onClick={(e) => handleLike(e, String(course.id))}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '4px 10px',
                                                            borderRadius: '12px',
                                                            background: isLiked
                                                                ? 'rgba(255,80,80,0.15)'
                                                                : 'rgba(255,255,255,0.05)',
                                                            border: isLiked
                                                                ? '1px solid rgba(255,80,80,0.3)'
                                                                : '1px solid rgba(255,255,255,0.08)',
                                                            cursor: isLiked ? 'default' : 'pointer',
                                                            flexShrink: 0,
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.8rem' }}>
                                                            {isLiked ? '❤️' : '🤍'}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            color: isLiked
                                                                ? '#ff5050'
                                                                : 'rgba(255,255,255,0.5)'
                                                        }}>
                                                            {Number(course.likes) || 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Subtitle */}
                                                <div style={{
                                                    fontSize: '0.78rem',
                                                    color: 'rgba(255,255,255,0.4)',
                                                    marginBottom: '8px',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {course.title || course.subtitle}
                                                </div>

                                                {/* Bottom row: tags + author + date */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '4px',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        {tags.filter(t => t.trim()).slice(0, 3).map((tag, i) => (
                                                            <span key={i} style={{
                                                                fontSize: '0.65rem',
                                                                fontWeight: '600',
                                                                padding: '3px 8px',
                                                                borderRadius: '8px',
                                                                background: course.runMode === 'oneWay'
                                                                    ? 'rgba(255,158,0,0.12)'
                                                                    : 'rgba(0,243,255,0.12)',
                                                                color: course.runMode === 'oneWay'
                                                                    ? '#ff9e00'
                                                                    : '#00f3ff'
                                                            }}>
                                                                {tag.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        color: 'rgba(255,255,255,0.25)',
                                                        flexShrink: 0
                                                    }}>
                                                        {course.authorName || '익명'} · {formatDate(course.createdAt)}
                                                    </div>
                                                </div>

                                                {isThisLoading && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        textAlign: 'center',
                                                        fontSize: '0.75rem',
                                                        color: '#00f3ff'
                                                    }}>
                                                        코스 불러오는 중...
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(60px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}
            </style>
        </div>
    );
};

export default SharedCoursesPanel;

import React, { useState, useEffect } from 'react';
import { fetchSharedCourses, fetchCourseDetail, likeCourse } from '../logic/sheetsApi';

const SharedCoursesPanel = ({ isOpen, onClose, onLoadCourse }) => {
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingCourseId, setLoadingCourseId] = useState(null);
    const [likedIds, setLikedIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('roadrunner_liked') || '[]');
        } catch { return []; }
    });

    useEffect(() => {
        if (isOpen) loadCourses();
    }, [isOpen]);

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

    const handleLoadCourse = async (courseId) => {
        setLoadingCourseId(courseId);
        try {
            const detail = await fetchCourseDetail(courseId);
            if (detail) {
                // routePath가 문자열이면 파싱
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
        if (likedIds.includes(courseId)) return; // 이미 좋아요 한 코스

        try {
            const result = await likeCourse(courseId);
            // UI 즉시 업데이트
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
        const month = d.getMonth() + 1;
        const day = d.getDate();
        return `${month}/${day}`;
    };

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
                    padding: '8px 24px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{
                            fontSize: '1.3rem',
                            fontWeight: '800',
                            color: '#fff'
                        }}>
                            추천 코스 🔥
                        </div>
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.4)',
                            marginTop: '2px'
                        }}>
                            러너들이 공유한 코스를 달려보세요
                        </div>
                    </div>
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

                {/* Course List */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '0 16px 24px',
                    scrollbarWidth: 'none'
                }}>
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
                `}
            </style>
        </div>
    );
};

export default SharedCoursesPanel;

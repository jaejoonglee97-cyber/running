import React, { useState, useEffect } from 'react';
import { fetchSharedCourses, fetchCourseDetail, likeCourse } from '../logic/sheetsApi';
import { PRESET_AREAS, PRESET_COURSES } from '../logic/presetCourses';
import { CourseManager } from '../logic/courseManager';
import { Button } from '@/components/ui/button';

const SharedCoursesPanel = ({ isOpen, onClose, onLoadCourse }) => {
  const [activeTab, setActiveTab] = useState('preset');
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
        runMode: preset.runMode,
      });
      onClose();
    } catch (err) {
      console.error('추천 코스 생성 실패:', err);
      alert('경로 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoadingCourseId(null);
    }
  };

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
      setCourses((prev) =>
        prev.map((c) =>
          String(c.id) === String(courseId) ? { ...c, likes: result.likes } : c
        )
      );
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

  const filteredPresets = PRESET_COURSES.filter((c) => c.area === selectedArea);
  const currentArea = PRESET_AREAS.find((a) => a.id === selectedArea);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[2500] flex items-end justify-center bg-black/75 backdrop-blur-md animate-[fadeIn_0.25s_ease-out]"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      >
        <div
          className="flex w-full max-w-[420px] flex-col rounded-t-3xl border border-white/10 border-b-0 bg-gradient-to-b from-[#1a1a2e] to-[#12121f] shadow-[-10px_-10px_40px_rgba(0,0,0,0.5)] animate-[slideUp_0.35s_ease-out]"
          style={{ maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-label="러닝 코스"
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-sm bg-white/20" />
          </div>
          <div className="px-6 pb-3 pt-2">
            <div className="text-[1.3rem] font-extrabold text-white mb-1">러닝 코스 🔥</div>
            <div className="text-[0.8rem] text-white/40">서울 인기 코스를 달려보세요</div>
          </div>

          <div className="mb-3 flex gap-1 px-5">
            <button
              type="button"
              onClick={() => setActiveTab('preset')}
              className="flex-1 rounded-xl py-2.5 text-[0.85rem] font-bold transition-all duration-200"
              style={{
                background: activeTab === 'preset' ? 'rgba(0,243,255,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeTab === 'preset' ? '#00f3ff' : 'rgba(255,255,255,0.4)',
                outline: activeTab === 'preset' ? '1px solid rgba(0,243,255,0.3)' : '1px solid transparent',
              }}
            >
              📍 추천 코스
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shared')}
              className="flex-1 rounded-xl py-2.5 text-[0.85rem] font-bold transition-all duration-200"
              style={{
                background: activeTab === 'shared' ? 'rgba(255,158,0,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeTab === 'shared' ? '#ff9e00' : 'rgba(255,255,255,0.4)',
                outline: activeTab === 'shared' ? '1px solid rgba(255,158,0,0.3)' : '1px solid transparent',
              }}
            >
              🏃 공유 코스
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-none">
            {activeTab === 'preset' ? (
              <>
                <div className="mb-3.5 flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                  {PRESET_AREAS.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setSelectedArea(area.id)}
                      className="shrink-0 whitespace-nowrap rounded-[20px] px-4 py-2 text-[0.8rem] font-bold transition-all duration-200"
                      style={{
                        border: selectedArea === area.id ? '1px solid rgba(0,243,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        background: selectedArea === area.id ? 'rgba(0,243,255,0.12)' : 'rgba(255,255,255,0.04)',
                        color: selectedArea === area.id ? '#00f3ff' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {area.emoji} {area.name}
                    </button>
                  ))}
                </div>
                <div className="mb-2.5 flex items-center gap-1.5 px-1 text-[0.78rem] text-white/35">
                  <span className="text-[1.1rem]">{currentArea?.emoji}</span>
                  {currentArea?.name} · {currentArea?.subtitle} · {filteredPresets.length}개 코스
                </div>
                <div className="flex flex-col gap-2.5">
                  {filteredPresets.map((preset) => {
                    const isThisLoading = loadingCourseId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleLoadPreset(preset)}
                        disabled={!!loadingCourseId}
                        className="w-full rounded-2xl border px-[18px] py-4 text-left transition-all duration-200"
                        style={{
                          borderColor: isThisLoading ? 'rgba(0,243,255,0.3)' : 'rgba(255,255,255,0.08)',
                          background: isThisLoading ? 'rgba(0,243,255,0.1)' : 'rgba(255,255,255,0.04)',
                          cursor: loadingCourseId ? 'wait' : 'pointer',
                          opacity: loadingCourseId && !isThisLoading ? 0.5 : 1,
                        }}
                      >
                        <div className="mb-1.5 flex items-start justify-between">
                          <div className="flex-1 text-base font-extrabold text-white">{preset.courseName}</div>
                          <div className="shrink-0 rounded-[10px] bg-neon-blue/10 px-2.5 py-0.5 text-[0.85rem] font-extrabold text-neon-blue">
                            {preset.distanceKm}km
                          </div>
                        </div>
                        <div className="mb-2 text-[0.75rem] leading-snug text-white/40">{preset.subtitle}</div>
                        <div className="flex flex-wrap gap-1">
                          {preset.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-neon-blue/10 px-2 py-0.5 text-[0.65rem] font-semibold text-neon-blue"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        {isThisLoading && (
                          <div className="mt-2.5 text-center text-[0.78rem] text-neon-blue animate-pulse-opacity">
                            🗺️ 경로 생성 중...
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div className="mb-2.5 flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={loadCourses}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/50"
                    style={{ transform: isLoading ? 'rotate(360deg)' : 'none', transition: 'transform 0.3s' }}
                  >
                    🔄
                  </Button>
                </div>
                {isLoading && courses.length === 0 ? (
                  <div className="py-[60px] px-5 text-center text-[0.9rem] text-white/30">
                    <div className="mb-3 text-[2rem]">🏃‍♂️</div>
                    불러오는 중...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="py-[60px] px-5 text-center text-[0.9rem] text-white/30">
                    <div className="mb-3 text-[2rem]">🏜️</div>
                    아직 공유된 코스가 없어요
                    <br />
                    첫 번째 코스를 공유해 보세요!
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {courses.map((course) => {
                      const isLiked = likedIds.includes(String(course.id));
                      const isThisLoading = loadingCourseId === String(course.id);
                      const tags = course.tags
                        ? typeof course.tags === 'string'
                          ? course.tags.split(',')
                          : course.tags
                        : [];
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => handleLoadCourse(String(course.id))}
                          disabled={!!loadingCourseId}
                          className="w-full rounded-2xl border border-white/8 px-[18px] py-4 text-left transition-all duration-200"
                          style={{
                            background: isThisLoading ? 'rgba(0,243,255,0.1)' : 'rgba(255,255,255,0.04)',
                            cursor: loadingCourseId ? 'wait' : 'pointer',
                            opacity: loadingCourseId && !isThisLoading ? 0.5 : 1,
                          }}
                        >
                          <div className="mb-1.5 flex items-start justify-between">
                            <div className="flex-1 text-base font-extrabold text-white">
                              {course.courseName || course.title}
                            </div>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => handleLike(e, String(course.id))}
                              className="flex items-center gap-1 rounded-xl border px-2.5 py-1 shrink-0 transition-all duration-200"
                              style={{
                                background: isLiked ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.05)',
                                borderColor: isLiked ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.08)',
                                cursor: isLiked ? 'default' : 'pointer',
                              }}
                            >
                              <span className="text-[0.8rem]">{isLiked ? '❤️' : '🤍'}</span>
                              <span
                                className="text-[0.75rem] font-bold"
                                style={{ color: isLiked ? '#ff5050' : 'rgba(255,255,255,0.5)' }}
                              >
                                {Number(course.likes) || 0}
                              </span>
                            </div>
                          </div>
                          <div className="mb-2 text-[0.78rem] leading-snug text-white/40">
                            {course.title || course.subtitle}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {tags.filter((t) => t.trim()).slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="rounded-lg px-2 py-0.5 text-[0.65rem] font-semibold"
                                  style={{
                                    background: course.runMode === 'oneWay' ? 'rgba(255,158,0,0.12)' : 'rgba(0,243,255,0.12)',
                                    color: course.runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                                  }}
                                >
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                            <div className="shrink-0 text-[0.7rem] text-white/25">
                              {course.authorName || '익명'} · {formatDate(course.createdAt)}
                            </div>
                          </div>
                          {isThisLoading && (
                            <div className="mt-2 text-center text-[0.75rem] text-neon-blue">코스 불러오는 중...</div>
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
      </div>
    </>
  );
};

export default SharedCoursesPanel;

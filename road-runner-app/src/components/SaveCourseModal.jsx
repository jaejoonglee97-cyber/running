import React, { useState } from 'react';

const COURSE_EMOJIS = ['🍠', '🌊', '🔥', '🏃', '⚡', '🌙', '🌅', '🍃', '💨', '🎯', '🦋', '🌈', '🍁', '☀️', '🐿️'];

const SaveCourseModal = ({ isOpen, onClose, onSave, courseDescription, isLoading }) => {
    const [courseName, setCourseName] = useState('');
    const [authorName, setAuthorName] = useState(() => {
        return localStorage.getItem('roadrunner_author') || '';
    });
    const [selectedEmoji, setSelectedEmoji] = useState('🏃');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!courseName.trim()) return;

        // 작성자 이름 기억
        localStorage.setItem('roadrunner_author', authorName);

        const fullName = `${courseName.trim()} ${selectedEmoji}`;
        onSave({
            courseName: fullName,
            authorName: authorName.trim() || '익명 러너'
        });
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(10px)',
                zIndex: 3000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.25s ease-out'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '380px',
                    borderRadius: '24px',
                    background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    padding: '28px 24px',
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                {/* Header */}
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
                            코스 저장하기 📌
                        </div>
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.4)'
                        }}>
                            나만의 이름을 붙여 공유하세요
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: '36px', height: '36px',
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

                {/* Course Preview */}
                {courseDescription && (
                    <div style={{
                        padding: '14px 16px',
                        borderRadius: '14px',
                        background: 'rgba(0,243,255,0.08)',
                        border: '1px solid rgba(0,243,255,0.15)',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            color: '#00f3ff',
                            marginBottom: '4px'
                        }}>
                            {courseDescription.title}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.4)'
                        }}>
                            {courseDescription.subtitle}
                        </div>
                    </div>
                )}

                {/* Course Name Input */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '8px',
                        display: 'block'
                    }}>
                        코스 이름
                    </label>
                    <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="예: 고구마런, 여의도 한바퀴"
                        maxLength={30}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: '600',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(0,243,255,0.5)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                        autoFocus
                    />
                </div>

                {/* Emoji Picker */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '8px',
                        display: 'block'
                    }}>
                        이모지 선택
                    </label>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        {COURSE_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => setSelectedEmoji(emoji)}
                                style={{
                                    width: '40px', height: '40px',
                                    borderRadius: '12px',
                                    border: selectedEmoji === emoji
                                        ? '2px solid rgba(0,243,255,0.8)'
                                        : '1px solid rgba(255,255,255,0.1)',
                                    background: selectedEmoji === emoji
                                        ? 'rgba(0,243,255,0.15)'
                                        : 'rgba(255,255,255,0.05)',
                                    fontSize: '1.2rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    transform: selectedEmoji === emoji ? 'scale(1.1)' : 'scale(1)'
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Author Name Input */}
                <div style={{ marginBottom: '24px' }}>
                    <label style={{
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: '8px',
                        display: 'block'
                    }}>
                        닉네임
                    </label>
                    <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="익명 러너"
                        maxLength={15}
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.15)',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'border 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(0,243,255,0.5)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                    />
                </div>

                {/* Preview */}
                {courseName.trim() && (
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '20px',
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.3)'
                        }}>미리보기:</span>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            color: '#fff',
                            marginTop: '4px'
                        }}>
                            {courseName.trim()} {selectedEmoji}
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={!courseName.trim() || isLoading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        borderRadius: '14px',
                        border: 'none',
                        background: courseName.trim()
                            ? 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)'
                            : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        cursor: courseName.trim() ? 'pointer' : 'not-allowed',
                        opacity: courseName.trim() ? 1 : 0.5,
                        boxShadow: courseName.trim()
                            ? '0 0 25px rgba(0,114,255,0.4)'
                            : 'none',
                        transition: 'all 0.3s'
                    }}
                >
                    {isLoading ? '저장 중...' : '공유하기 🚀'}
                </button>
            </div>

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

export default SaveCourseModal;

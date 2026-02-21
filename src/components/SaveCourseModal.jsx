import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COURSE_EMOJIS = ['🍠', '🌊', '🔥', '🏃', '⚡', '🌙', '🌅', '🍃', '💨', '🎯', '🦋', '🌈', '🍁', '☀️', '🐿️'];

const SaveCourseModal = ({ isOpen, onClose, onSave, courseDescription, isLoading }) => {
  const [courseName, setCourseName] = useState('');
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('roadrunner_author') || '');
  const [selectedEmoji, setSelectedEmoji] = useState('🏃');

  const handleSave = () => {
    if (!courseName.trim()) return;
    localStorage.setItem('roadrunner_author', authorName);
    const fullName = `${courseName.trim()} ${selectedEmoji}`;
    onSave({
      courseName: fullName,
      authorName: authorName.trim() || '익명 러너',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-white/10 bg-gradient-to-b from-[#1a1a2e] to-[#16162a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        <DialogHeader className="mb-6 flex flex-row items-start justify-between space-y-0">
          <div>
            <DialogTitle className="mb-1">코스 저장하기 📌</DialogTitle>
            <DialogDescription>나만의 이름을 붙여 공유하세요</DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white/50"
          >
            ✕
          </Button>
        </DialogHeader>

        {courseDescription && (
          <div className="mb-5 rounded-[14px] border border-neon-blue/15 bg-neon-blue/10 px-4 py-3.5">
            <div className="mb-1 text-[0.85rem] font-bold text-neon-blue">{courseDescription.title}</div>
            <div className="text-[0.75rem] text-white/40">{courseDescription.subtitle}</div>
          </div>
        )}

        <div className="mb-4">
          <Label>코스 이름</Label>
          <Input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="예: 고구마런, 여의도 한바퀴"
            maxLength={30}
            className="mt-2 border-white/15 bg-white/5 focus:border-neon-blue/50"
            autoFocus
          />
        </div>

        <div className="mb-4">
          <Label>이모지 선택</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {COURSE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setSelectedEmoji(emoji)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border text-[1.2rem] transition-all duration-200"
                style={{
                  borderColor: selectedEmoji === emoji ? 'rgba(0,243,255,0.8)' : 'rgba(255,255,255,0.1)',
                  borderWidth: selectedEmoji === emoji ? 2 : 1,
                  background: selectedEmoji === emoji ? 'rgba(0,243,255,0.15)' : 'rgba(255,255,255,0.05)',
                  transform: selectedEmoji === emoji ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Label>닉네임</Label>
          <Input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="익명 러너"
            maxLength={15}
            className="mt-2 text-[0.95rem]"
          />
        </div>

        {courseName.trim() && (
          <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
            <span className="text-[0.75rem] text-white/30">미리보기:</span>
            <div className="mt-1 text-[1.1rem] font-extrabold text-white">
              {courseName.trim()} {selectedEmoji}
            </div>
          </div>
        )}

        <Button
          variant="default"
          onClick={handleSave}
          disabled={!courseName.trim() || isLoading}
          className="w-full rounded-[14px] py-4 text-base font-extrabold tracking-wide transition-all duration-300 disabled:bg-white/10 disabled:opacity-50 disabled:shadow-none"
          style={{
            boxShadow: courseName.trim() ? '0 0 25px rgba(0,114,255,0.4)' : 'none',
          }}
        >
          {isLoading ? '저장 중...' : '공유하기 🚀'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCourseModal;

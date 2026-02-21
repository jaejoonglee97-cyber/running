import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import type { CourseDescription } from '../types/course';

interface SaveCourseModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: { courseName: string; authorName: string }) => void;
  courseDescription: CourseDescription | null;
  isLoading: boolean;
}

const COURSE_EMOJIS = ['🍠', '🌊', '🔥', '🏃', '⚡', '🌙', '🌅', '🍃', '💨', '🎯'];

export default function SaveCourseModal({
  visible,
  onClose,
  onSave,
  courseDescription,
  isLoading,
}: SaveCourseModalProps) {
  const [courseName, setCourseName] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏃');

  const handleSave = () => {
    if (!courseName.trim()) return;
    onSave({
      courseName: `${courseName.trim()} ${selectedEmoji}`,
      authorName: authorName.trim() || '익명 러너',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.box} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>코스 저장하기 📌</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>
          {courseDescription && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>{courseDescription.title}</Text>
              <Text style={styles.previewSubtitle}>{courseDescription.subtitle}</Text>
            </View>
          )}
          <Text style={styles.label}>코스 이름</Text>
          <TextInput
            style={styles.input}
            value={courseName}
            onChangeText={setCourseName}
            placeholder="예: 고구마런, 여의도 한바퀴"
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={30}
            autoFocus
          />
          <Text style={styles.label}>이모지</Text>
          <View style={styles.emojiRow}>
            {COURSE_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiBtnSelected]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            style={styles.input}
            value={authorName}
            onChangeText={setAuthorName}
            placeholder="익명 러너"
            placeholderTextColor="rgba(255,255,255,0.4)"
            maxLength={15}
          />
          <Pressable
            style={[styles.saveBtn, (!courseName.trim() || isLoading) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!courseName.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>공유하기 🚀</Text>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  closeBtn: { fontSize: 18, color: 'rgba(255,255,255,0.5)' },
  preview: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(0,243,255,0.1)',
    marginBottom: 20,
  },
  previewTitle: { fontSize: 14, fontWeight: '700', color: '#00f3ff', marginBottom: 4 },
  previewSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  label: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
  },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnSelected: {
    borderColor: 'rgba(0,243,255,0.8)',
    borderWidth: 2,
    backgroundColor: 'rgba(0,243,255,0.15)',
  },
  emojiText: { fontSize: 18 },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#0072FF',
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});

import { useState } from "react";
import { Plus, Image as ImageIcon, Smile, MoreHorizontal, BookHeart } from "lucide-react";
import { mockDiaries } from "../store";
import styles from "./Diary.module.css";

export function Diary() {
  const [isWriting, setIsWriting] = useState(false);

  return (
    <div className={styles.diaryContainer}>
      <div className={styles.diaryHeader}>
        <div>
          <h1 className={styles.diaryTitle}>
            <BookHeart className={styles.diaryTitleIcon} />
            나의 다이어리
          </h1>
          <p className={styles.diarySubtitle}>대학 생활의 소중한 순간들을 기록하세요.</p>
        </div>
        <button 
          onClick={() => setIsWriting(true)}
          className={styles.btnNewDiary}
        >
          <Plus className={styles.btnNewDiaryIcon} />
          새 일기 쓰기
        </button>
      </div>

      {isWriting && (
        <div className={styles.diaryEditor}>
          <input 
            type="text" 
            placeholder="제목을 입력하세요..." 
            className={styles.diaryEditorTitle}
          />
          <textarea 
            placeholder="오늘 하루는 어땠나요?" 
            rows={5}
            className={styles.diaryEditorContent}
          ></textarea>
          
          <div className={styles.diaryEditorTools}>
            <div className={styles.diaryEditorButtons}>
              <button className={styles.diaryToolBtn}>
                <ImageIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
              <button className={styles.diaryToolBtn}>
                <Smile style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
            <div className={styles.diaryEditorActions}>
              <button 
                onClick={() => setIsWriting(false)}
                className={styles.btnCancel}
              >
                취소
              </button>
              <button className={styles.btnSave}>
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.diaryList}>
        {mockDiaries.map(diary => (
          <div key={diary.id} className={styles.diaryItem}>
            
            <div className={styles.diaryDateBadge}>
              <span className={styles.diaryDateMonth}>
                {new Date(diary.date).toLocaleString('en-US', { month: 'short' })}
              </span>
              <span className={styles.diaryDateDay}>
                {new Date(diary.date).getDate()}
              </span>
              <div className={styles.diaryMood}>
                {diary.mood === 'happy' ? '😊' : diary.mood === 'sad' ? '😢' : diary.mood === 'stressed' ? '😫' : '😐'}
              </div>
            </div>

            <div className={styles.diaryContent}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 className={styles.diaryItemTitle}>{diary.title}</h3>
                <button className={styles.diaryItemMenu}>
                  <MoreHorizontal style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>
              <p className={styles.diaryItemText}>{diary.content}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

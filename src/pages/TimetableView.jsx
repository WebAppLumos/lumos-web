import { Calendar } from "lucide-react";
import styles from "./TimetableView.module.css";

export function TimetableView() {
  return (
    <div className={styles.timetableContainer}>
      <h1 className={styles.timetableTitle}>시간표 & 일정 관리</h1>
      <p className={styles.timetableSubtitle}>여기에 주간 시간표와 캘린더가 들어갑니다.</p>
      <div className={styles.timetablePlaceholder}>
        <Calendar className={styles.timetablePlaceholderIcon} />
        <p className={styles.timetablePlaceholderText}>전체 일정 뷰어 영역</p>
      </div>
    </div>
  );
}

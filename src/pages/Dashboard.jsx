import { useState } from "react";
import { Link } from "react-router-dom";
import { Settings2, Clock, MapPin, Calendar, Sparkles, BookHeart, Plus } from "lucide-react";
import { mockWidgets, mockScholarships, mockTodayClasses, mockSchedules, mockDiaries } from "../store";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const [widgets, setWidgets] = useState(mockWidgets);
  const [isEditing, setIsEditing] = useState(false);

  const toggleWidget = (id) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardTitle}>
          <h1>마이 대시보드</h1>
          <p>나만의 관심사로 조립하는 대학 생활 맞춤 화면</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`${styles.btnEdit} ${isEditing ? styles.btnEditActive : styles.btnEditDefault}`}
        >
          <Settings2 className={styles.btnEditIcon} />
          {isEditing ? '편집 완료' : '위젯 편집'}
        </button>
      </div>

      {isEditing && (
        <div className={styles.widgetEditor}>
          <h3 className={styles.widgetEditorTitle}>
            <Plus />
            대시보드에 표시할 위젯을 선택하세요
          </h3>
          <div className={styles.widgetEditorButtons}>
            {widgets.map(widget => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`${styles.widgetBtn} ${widget.visible ? styles.widgetBtnActive : ''}`}
              >
                {widget.title} {widget.visible && '✓'}
              </button>
            ))}
          </div>
        </div>
      )}

      {visibleWidgets.length === 0 ? (
        <div className={styles.emptyState}>
          <Settings2 className={styles.emptyStateIcon} />
          <p className={styles.emptyStateText}>표시할 위젯이 없습니다. 위젯을 추가해주세요.</p>
        </div>
      ) : (
        <div className={styles.widgetGrid}>
          {visibleWidgets.map(widget => (
            <div key={widget.id} className={styles.widgetItem}>
              {isEditing && (
                <div className={styles.btnClose}>
                  <button 
                    onClick={() => toggleWidget(widget.id)}
                    className={styles.btnCloseIcon}
                  >
                    ✕
                  </button>
                </div>
              )}
              {renderWidgetContent(widget.type, isEditing, styles)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderWidgetContent(type, isEditing, styles) {
  const cardClass = `${styles.card} ${isEditing ? styles.cardEditing : ''}`;

  if (type === 'timetable') {
    return (
      <div className={cardClass}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardHeaderTitle}>
            <Clock />
            오늘의 시간표
          </h3>
          <Link to="/timetable" className={styles.cardHeaderLink}>전체보기</Link>
        </div>
        <div className={styles.cardContent}>
          <ul className={styles.timetableList}>
            {mockTodayClasses.map((c) => (
              <li key={c.id} className={styles.timetableItem}>
                <div className={styles.timetableDot}></div>
                <div className={styles.timetableBody}>
                  <div className={styles.timetableItemTitle}>{c.name}</div>
                  <div className={styles.timetableItemMeta}>
                    <Clock className={styles.timetableItemMetaIcon} /> {c.time}
                    <span className={styles.timetableItemMetaSeparator}>•</span>
                    <MapPin className={styles.timetableItemMetaIcon} /> {c.room}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (type === 'scholarship') {
    return (
      <div className={cardClass}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardHeaderTitle}>
            <Sparkles />
            맞춤 장학금 큐레이션
          </h3>
          <Link to="/scholarships" className={styles.cardHeaderLink}>더보기</Link>
        </div>
        <div className={styles.cardContentNoPadding}>
          <ul className={styles.scholarshipList}>
            {mockScholarships.slice(0, 2).map(s => (
              <li key={s.id} className={styles.scholarshipItem}>
                <div className={styles.scholarshipItemMeta}>
                  <span className={styles.scholarshipMatchRate}>
                    매칭률 {s.matchRate}%
                  </span>
                  <span className={styles.scholarshipDDay}>
                    D-{Math.floor(Math.random() * 10) + 1}
                  </span>
                </div>
                <h4 className={styles.scholarshipItemTitle}>{s.title}</h4>
                <p className={styles.scholarshipItemOrg}>{s.organization} • {s.amount}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  if (type === 'schedule') {
    return (
      <div className={cardClass}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardHeaderTitle}>
            <Calendar />
            다가오는 일정
          </h3>
          <button className={styles.cardHeaderLink} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <Plus style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.scheduleList}>
            {mockSchedules.slice(0, 3).map(s => (
              <div key={s.id} className={styles.scheduleItem}>
                <div className={styles.scheduleDateBadge}>
                  <div className={styles.scheduleDateMonth}>{new Date(s.date).toLocaleString('en-US', { month: 'short' })}</div>
                  <div className={styles.scheduleDateDay}>{new Date(s.date).getDate()}</div>
                </div>
                <div>
                  <div className={styles.scheduleItemTitle}>{s.title}</div>
                  <div className={styles.scheduleItemType}>
                    {s.type === 'academic' ? '학사 일정' : s.type === 'club' ? '동아리' : '개인 일정'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'diary') {
    return (
      <div className={cardClass}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardHeaderTitle}>
            <BookHeart />
            최근 다이어리
          </h3>
          <Link to="/diary" className={styles.cardHeaderLink}>작성하기</Link>
        </div>
        <div className={styles.cardContent}>
          {mockDiaries.length > 0 ? (
            <div className={styles.diaryCard}>
              <div className={styles.diaryEmoji}>💭</div>
              <div className={styles.diaryContent}>
                <h4 className={styles.diaryTitle}>{mockDiaries[0].title}</h4>
                <p className={`${styles.diaryText} line-clamp-3`}>{mockDiaries[0].content}</p>
                <div className={styles.diaryDate}>{mockDiaries[0].date}</div>
              </div>
            </div>
          ) : (
            <div className={styles.diaryEmpty}>
              <BookHeart className={styles.diaryEmptyIcon} />
              <p className={styles.diaryEmptyText}>오늘 하루는 어땠나요?</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

import { useState } from "react";
import { Search, Sparkles, Filter, Bookmark } from "lucide-react";
import { mockScholarships } from "../store";
import styles from "./Scholarships.module.css";

export function Scholarships() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={styles.scholarshipsContainer}>
      <div className={styles.scholarshipsHeader}>
        <div>
          <div className={styles.scholarshipsBadge}>
            <Sparkles className={styles.scholarshipsBadgeIcon} />
            내 프로필 기반 추천
          </div>
          <h1 className={styles.scholarshipsTitle}>맞춤 장학금 큐레이션</h1>
          <p className={styles.scholarshipsSubtitle}>김대학 님의 성적, 소득분위, 활동 내역에 맞는 장학금을 찾았습니다.</p>
        </div>
        <div className={styles.scholarshipsCount}>
          <p className={styles.scholarshipsCountLabel}>현재 신청 가능한 장학금</p>
          <p className={styles.scholarshipsCountNumber}>{mockScholarships.length}개</p>
        </div>
      </div>

      <div className={styles.scholarshipsControls}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="장학금명, 주관기관 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className={styles.btnFilter}>
          <Filter className={styles.btnFilterIcon} />
          필터
        </button>
      </div>

      <div className={styles.scholarshipsList}>
        {mockScholarships.map(scholarship => (
          <div key={scholarship.id} className={styles.scholarshipCard}>
            
            <div className={styles.scholarshipCardIcon}>
              {scholarship.matchRate}%
            </div>

            <div className={styles.scholarshipCardContent}>
              <div className={styles.scholarshipCardMeta}>
                <span className={styles.scholarshipOrg}>{scholarship.organization}</span>
                <span className={styles.scholarshipDday}>
                  D-{Math.floor(Math.random() * 10) + 1}
                </span>
              </div>
              <h3 className={styles.scholarshipCardTitle}>{scholarship.title}</h3>
              <div className={styles.scholarshipTags}>
                {scholarship.tags.map(tag => (
                  <span key={tag} className={styles.scholarshipTag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.scholarshipCardAmount}>
              <div>
                <p className={styles.scholarshipAmount}>지원 금액</p>
                <p className={styles.scholarshipAmountNumber}>{scholarship.amount}</p>
              </div>
              <div className={styles.scholarshipCardActions}>
                <button className={styles.btnBookmark}>
                  <Bookmark style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
                <button className={styles.btnDetail}>
                  상세보기
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

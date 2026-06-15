// 계명대 성서캠퍼스 편의시설 mock-data (공식 안내 기준)

const DORM = [35.85705832685428, 128.4802146357763];
const BAUER = [35.85425659878625, 128.48616494439423];
const LIBRARY = [35.85640495369977, 128.48714874254276];
const ENG1 = [35.859143003990205, 128.4876316274582];
const UIYANG = [35.85625579439296, 128.4850012009452];
const GYM = [35.85443051705646, 128.48994840717393];
const MUSIC = [35.852872096471415, 128.49062767449203];
const INDUSTRY = [35.8585, 128.4885];

const places = [
  // ── 카페 / 북카페 ──
  { id: 1, name: "CAFE BLUEPOT", building: ["공학1호관", "공대"], type: "카페", floor: "1F", time: "평일 08:30 - 17:00 (금 16:00)", lat: ENG1[0], lng: ENG1[1] },
  { id: 2, name: "카페 사월", building: ["행소박물관"], type: "카페", floor: "B1F", time: "평일 09:00 - 18:00 (금 17:00)", lat: 35.85669535477981, lng: 128.48989393341768 },
  { id: 3, name: "cafe ing 동산도서관", building: ["동산도서관", "도서관"], type: "카페", floor: "B1F", time: "평일 08:30 - 18:00", lat: LIBRARY[0], lng: LIBRARY[1] },
  { id: 4, name: "피피커피", building: ["의양관"], type: "카페", floor: "B1F", time: "평일 08:30 - 19:00 (금 18:00)", lat: UIYANG[0], lng: UIYANG[1] },
  { id: 5, name: "CORNER BAKERY", building: ["구바우어관"], type: "카페", floor: "B1F", time: "평일 08:00 - 20:00", lat: BAUER[0], lng: BAUER[1] },
  { id: 6, name: "cafe ing 동영관", building: ["동영관"], type: "카페", floor: "1F", time: "평일 08:30 - 17:00", lat: 35.85325485066771, lng: 128.48446094669262 },
  { id: 7, name: "cafe N", building: ["음악공연예술대학", "음대"], type: "카페", floor: "B1F", time: "평일 08:30 - 19:00", lat: MUSIC[0], lng: MUSIC[1] },

  // ── 학식당 / Food Court ──
  { id: 16, name: "바우어관 학생식당", building: ["구바우어관"], type: "학식당", floor: "B1F", time: "평일 09:00 - 19:00 (방학 10:00 - 15:00)", info: "한식·양식·분식", lat: BAUER[0], lng: BAUER[1] },
  { id: 17, name: "신바우어관 Food Court", building: ["신바우어관"], type: "학식당", floor: "2F", time: "평일 09:00 - 19:00", info: "한식·중분식·양식·패스트푸드·북카페 10:00 - 18:00", lat: 35.853896173955235, lng: 128.48543317244648 },
  { id: 18, name: "아람관 3F 식당", building: ["아람관"], type: "학식당", floor: "3F", time: "평일 07:30 - 19:00", info: "한식당·양식당·커피·매점", lat: 35.853956594358515, lng: 128.48291324663953 },
  { id: 20, name: "복지관 Food Court", building: ["복지관"], type: "학식당", floor: "1~2F", time: "평일 10:00 - 19:30 (토 11:00 - 15:00)", info: "식당·카페·편의점", lat: 35.8548, lng: 128.4875 },
  { id: 21, name: "만나동 생활관식당", building: ["만나동", "명교생활관", "기숙사"], type: "학식당", floor: "1~2F", time: "상시 운영", info: "800석", lat: DORM[0] + 0.00035, lng: DORM[1] + 0.00025 },

  // ── 편의점 / 마트 ──
  { id: 30, name: "emart24 바우어관", building: ["구바우어관"], type: "편의점", floor: "1F", time: "평일 08:00 - 22:00 (주말 무인)", lat: BAUER[0], lng: BAUER[1] },
  { id: 31, name: "세븐일레븐 체육관", building: ["체육관"], type: "편의점", floor: "1F", time: "평일 07:40 - 18:40", lat: GYM[0], lng: GYM[1] },
  { id: 32, name: "산학협력관 마트", building: ["산학협력관"], type: "편의점", floor: "1F", time: "입점 예정 (2026. 6. 중)", lat: INDUSTRY[0], lng: INDUSTRY[1] },

  // ── 서점 / 문구 / 안경 / 우편 ──
  { id: 40, name: "구내서점", building: ["구바우어관"], type: "서점", floor: "B1F", time: "08:30 - 18:30", lat: BAUER[0], lng: BAUER[1] },
  { id: 41, name: "우편 취급국", building: ["구바우어관"], type: "생활편의", floor: "1F", time: "09:00 - 18:00", lat: BAUER[0], lng: BAUER[1] },
  { id: 42, name: "문구점", building: ["구바우어관"], type: "생활편의", floor: "B1F", time: "08:30 - 18:30", lat: BAUER[0], lng: BAUER[1] },
  { id: 43, name: "안경점", building: ["구바우어관"], type: "생활편의", floor: "B1F", time: "10:00 - 16:00", lat: BAUER[0], lng: BAUER[1] },
  { id: 44, name: "계명아트센터 간이판매점", building: ["계명아트센터"], type: "생활편의", floor: "1F", time: "공연일 운영", lat: 35.8542, lng: 128.4905 },

  // ── 은행 ──
  { id: 50, name: "iM뱅크 계명대지점", building: ["산학협력관"], type: "은행", floor: "1F", time: "평일 09:00 - 16:00", lat: INDUSTRY[0], lng: INDUSTRY[1] },

  // ── 도서관 ──
  { id: 60, name: "동산도서관", building: ["동산도서관", "도서관"], type: "도서관", time: "09:00 - 19:00", lat: LIBRARY[0], lng: LIBRARY[1] },
  { id: 61, name: "의학도서관", building: ["의과대", "의대"], type: "도서관", time: "08:30 - 22:00", lat: 35.85509916572842, lng: 128.4805102964029 },

  // ── 프린트 ──
  { id: 70, name: "동산도서관 프린트", building: ["동산도서관", "도서관"], type: "프린트", floor: "3F", time: "09:00 - 19:00", lat: LIBRARY[0], lng: LIBRARY[1] },
  { id: 71, name: "공학1호관 프린트", building: ["공학1호관", "공대"], type: "프린트", floor: "2F", time: "09:00 - 19:00", lat: ENG1[0], lng: ENG1[1] },
  { id: 72, name: "구바우어관 프린트", building: ["구바우어관"], type: "프린트", floor: "B1F", time: "09:00 - 19:00", lat: BAUER[0], lng: BAUER[1] },
  { id: 73, name: "의양관 프린트", building: ["의양관"], type: "프린트", floor: "B1F", time: "09:00 - 19:00", lat: UIYANG[0], lng: UIYANG[1] },
  { id: 74, name: "음악공연예술대학 프린트", building: ["음악공연예술대학", "음대"], type: "프린트", floor: "1F", time: "09:00 - 19:00", lat: MUSIC[0], lng: MUSIC[1] },

  // ── 공용 PC 실습실 ──
  { id: 80, name: "체육관 PC실습실", building: ["체육관"], type: "PC실습실", floor: "136호", time: "13:00 - 17:30", info: "053-580-5201 · 체육대학 행정팀", lat: GYM[0], lng: GYM[1] },
  { id: 81, name: "공학1호관 PC실습실", building: ["공학1호관", "공대"], type: "PC실습실", floor: "1209호", time: "08:50 - 17:30 (점심 12:00 - 13:00)", info: "053-580-5039 · 공과대학 행정팀", lat: ENG1[0], lng: ENG1[1] },
  { id: 82, name: "동영관 PC실습실", building: ["동영관"], type: "PC실습실", floor: "206호", time: "08:50 - 17:30 (점심 12:00 - 13:00)", info: "053-580-6518 · 사회과학대학·KAC·이부대학 행정팀", lat: 35.85325485066771, lng: 128.48446094669262 },
  { id: 83, name: "백은관 PC실습실", building: ["백은관"], type: "PC실습실", floor: "110호", time: "08:50 - 17:30 (점심 12:00 - 13:00)", info: "053-580-5205 · 자연과학대학·약학대학 행정팀", lat: 35.85373347568502, lng: 128.48237222708735 },
  { id: 84, name: "영암관 PC실습실", building: ["영암관"], type: "PC실습실", floor: "341호", time: "08:50 - 17:30 (점심 13:00 - 14:00)", info: "053-580-5203 · 인문국제학대학 행정팀", lat: 35.85415461789027, lng: 128.48402664390682 },
  { id: 85, name: "음악공연예술대학 PC실습실", building: ["음악공연예술대학", "음대"], type: "PC실습실", floor: "121호", time: "08:50 - 17:30 (점심 13:00 - 14:00)", info: "053-580-6597 · 음악공연예술대학 행정팀", lat: MUSIC[0], lng: MUSIC[1] },
  { id: 86, name: "의양관 PC실습실", building: ["의양관"], type: "PC실습실", floor: "123호", time: "08:50 - 17:30 (점심 상시 개방)", info: "053-580-5202 · 전산운영팀", lat: UIYANG[0], lng: UIYANG[1] },
  { id: 87, name: "봉경관 PC실습실", building: ["봉경관"], type: "PC실습실", floor: "228호", time: "08:50 - 22:00", info: "053-580-5206", lat: 35.85523851809555, lng: 128.48564639989385 },
  { id: 88, name: "동천관 PC실습실", building: ["동천관"], type: "PC실습실", floor: "103호", time: "08:50 - 17:30 (점심 12:00 - 13:00)", info: "053-580-5837 · 일반대학원 행정팀", lat: 35.8549, lng: 128.4835 },

  // ── 기숙사 / 비사고시원 ──
  { id: 90, name: "진리동", building: ["진리동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상5층", time: "", info: "79실 158명(남·여) · 2인1실 · 비사고시원 10실 40명(4인1실) · 층별 화장실·샤워·세면·세탁 / 동별 세미나·독서·휴게실", lat: DORM[0], lng: DORM[1] },
  { id: 92, name: "정의동", building: ["정의동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상5층", time: "", info: "97실 196명(여) · 2인1실", lat: DORM[0] + 0.00012, lng: DORM[1] + 0.00008 },
  { id: 93, name: "사랑동", building: ["사랑동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상4층", time: "", info: "89실 178명(남·여) · 2인1실", lat: DORM[0] + 0.00018, lng: DORM[1] + 0.0001 },
  { id: 94, name: "믿음동", building: ["믿음동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상10층·B1", time: "", info: "232실 500명(남) · 2인1실 · 실별 화장실겸 샤워 / 공동 세탁·휴게·세미나·B1 헬스장", lat: DORM[0] - 0.00015, lng: DORM[1] - 0.0001 },
  { id: 95, name: "소망동", building: ["소망동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상10층·B1", time: "", info: "233실 502명(여) · 2인1실 · 실별 화장실겸 샤워 / 공동 세탁·휴게·세미나·B1 헬스장", lat: DORM[0] - 0.0002, lng: DORM[1] - 0.00005 },
  { id: 96, name: "봉사동", building: ["봉사동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상8층·B1", time: "", info: "167실 334명(남) · 2인1실 · 실별 화장실겸 샤워 / 공동 세탁·휴게·세미나·B1 헬스장", lat: DORM[0] - 0.00025, lng: DORM[1] + 0.00015 },
  { id: 97, name: "협력동", building: ["협력동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상10층·B1", time: "", info: "186실 372명(여) · 2인1실 · 실별 화장실겸 샤워 / 층별 세탁·휴게·세미나·멀티미디어·학습실·B1 헬스장", lat: DORM[0] - 0.0001, lng: DORM[1] + 0.0002 },
  { id: 98, name: "관리동", building: ["관리동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상3층·B2", time: "", info: "관장실·Guest House(7실) / 2F 휴게·매점·사생자치회 / 1F 행정·중앙독서·파티룸 / B1 탁구·헬스 / B2 기계·전기실", lat: DORM[0] + 0.00025, lng: DORM[1] - 0.0001 },
  { id: 99, name: "예인당", building: ["예인당", "명교생활관", "기숙사"], type: "기숙사", floor: "지상5층", time: "", info: "50실 65명(외국인교원 전용) · 회의실·공동식당·휴게·세탁", lat: DORM[0] + 0.0003, lng: DORM[1] - 0.00015 },
  { id: 100, name: "신축동", building: ["신축동", "명교생활관", "기숙사"], type: "기숙사", floor: "지상10층·B1", time: "", info: "328실 652명(남·여) · 2인1실(장애인실 1인1실) · 실별 화장실겸 샤워 / 휴게·세탁·세미나·학습·헬스", lat: DORM[0] - 0.0003, lng: DORM[1] + 0.00025 },

  // ── 건물명 검색용 (시설 데이터가 없는 건물만) ──
  { id: 104, name: "쉐턱관", building: ["쉐턱관", "사회과학대학", "사과대", "인국대"], type: "건물", time: "", lat: 35.859301098309516, lng: 128.49014473257003 },
  { id: 107, name: "보산관", building: ["보산관", "약학대학"], type: "건물", time: "", lat: 35.854771210581035, lng: 128.48225871445842 },
  { id: 109, name: "공학 2호관", building: ["공학 2호관", "공과대학"], type: "건물", time: "", lat: 35.85924712716237, lng: 128.48686420006183 },
  { id: 110, name: "공학 3호관", building: ["공학 3호관", "공과대학"], type: "건물", time: "", lat: 35.85981413554627, lng: 128.4871044977509 },
  { id: 111, name: "공학 4호관", building: ["공학 4호관", "공과대학"], type: "건물", time: "", lat: 35.859716674456436, lng: 128.4876976993838 },
  { id: 114, name: "공학 7호관", building: ["공학 7호관", "공과대학", "덕래관"], type: "건물", time: "", lat: 35.859458496725146, lng: 128.48635061868276 },
  { id: 116, name: "전갑규관", building: ["전갑규관", "간호대학", "인문국제학대학", "인국대"], type: "건물", time: "", lat: 35.855309336711976, lng: 128.4793602007468 },
  { id: 117, name: "스미스관", building: ["스미스관", "Tabula Rasa College"], type: "건물", time: "", lat: 35.85642830201197, lng: 128.48362070233372 },
  { id: 122, name: "여농관", building: ["여농관", "공대 학생회관"], type: "건물", time: "", lat: 35.85820150914234, lng: 128.48943227586744 },
];

export default places;

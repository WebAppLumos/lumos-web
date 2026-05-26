function SideMenu() {

  return (
    <div className="leftMenu">

      <h2 className="logo">
        교내시설
      </h2>

      <div className="menuBox">

        <div className="menu">
          학사 일정 캘린더
        </div>

        <div className="menu">
          스마트 시간표
        </div>

        <div className="menu">
          과제 D-Day 알림
        </div>

        <div className="menu">
          맞춤 장학 추천
        </div>

        <div className="menu activeMenu">
          캠퍼스 맵
        </div>

      </div>

    </div>
  );
}

export default SideMenu;
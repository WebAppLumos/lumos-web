import "./SideMenu.css";

import { useState } from "react";

function SideMenu() {

  // 메뉴 열림 상태
  const [open, setOpen] = useState(false);

  return (

    <div className={open ? "leftMenu open" : "leftMenu"}>

      {/* 햄버거 버튼 */}
      <div
        className="menuButton"

        onClick={() => setOpen(!open)}
      >

        ☰

      </div>



      {/* 로고 */}
      <h2 className="logo">
        웹페이지 4조
      </h2>



      {/* 메뉴 */}
      <div className="menuBox">

        <div className="menu">
          📅 학사 일정 캘린더
        </div>

        <div className="menu">
          👍 스마트 시간표
        </div>

        <div className="menu">
          📋 과제 D-Day 알림
        </div>

        <div className="menu">
          🎓 맞춤 장학 추천
        </div>

        <div className="menu activeMenu">
          📖 캠퍼스 맵
        </div>

      </div>

    </div>
  );
}

export default SideMenu;
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import "./MapPage.css";

import SideMenu from "../components/SideMenu";

import Category from "../components/Category";

import { useState } from "react";

function MapPage() {

  const [category, setCategory] =
    useState("전체");

  return (
    <div className="container">

      {/* 왼쪽 메뉴 */}
      <SideMenu />

      {/* 가운데 */}
      <div className="centerBox">

        {/* 위 */}
        <div className="topBox">

          <div className="titleBox">

            <h1>
              교내시설
            </h1>

            <p>
              평소 활동 경로와 교내시설을 확인해보세요.
            </p>

          </div>

          <input
            className="search"
            placeholder="찾고 싶은 교내 시설"
          />

        </div>

        {/* 카테고리 */}
        <Category
          category={category}
          setCategory={setCategory}
        />

        {/* 지도 */}
        <div className="mapBox">

          <MapContainer
            center={[35.8532, 128.4913]}
            zoom={17}
            style={{
              width: "100%",
              height: "100%",
            }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"

              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[35.8542, 128.4925]}>

              <Popup>
                블루포트
              </Popup>

            </Marker>

          </MapContainer>

        </div>

      </div>

      {/* 오른쪽 */}
     <div className="rightBox">

        <h1>
            {category}
        </h1>

        {/* 시설 목록 */}
        <div className="placeList">

            <div className="placeBox activePlace">

            <h3>
                블루포트 공학관점
            </h3>

            <p>
                09:00 - 19:00
            </p>

            </div>

            <div className="placeBox">

            <h3>
                이디야
            </h3>

            <p>
                08:00 - 21:00
            </p>

            </div>

            <div className="placeBox">

            <h3>
                피피카페
            </h3>

            <p>
                08:30 - 19:00
            </p>

            </div>

        </div>

        {/* 다음 수업 */}
        <div className="nextClass">

            <h3>
            다음 수업
            </h3>

            <p>
            웹프로그래밍
            </p>

            <p>
            현재 위치에서 5분 소요
            </p>

        </div>

        </div>

    </div>
  );
}

export default MapPage;
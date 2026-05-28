import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
  useMap,
} from "react-leaflet";

import axios from "axios";

import "leaflet/dist/leaflet.css";

import "./MapPage.css";

import { useState, useEffect } from "react";

import SideMenu from "../components/SideMenu";
import Category from "../components/Category";
import PlaceList from "../components/PlaceList";

import places from "../data/places";


// 지도 이동 컴포넌트
function MoveMap(props) {

  const {
    position,
  } = props;

  const map = useMap();

  useEffect(() => {

    map.flyTo(position, 18);

  }, [position]);

  return null;
}


function MapPage() {

  // 현재 선택 카테고리
  const [category, setCategory] =
    useState("전체");


  // 지도 중심 위치
  const [
    selectedPosition,
    setSelectedPosition,
  ] = useState([35.8532, 128.4913]);


  // 현재 내 위치
  const [
    myPosition,
    setMyPosition,
  ] = useState([35.8532, 128.4913]);


  // 경로 좌표
  const [
    routePath,
    setRoutePath,
  ] = useState([]);


  // 카테고리 필터
  const filteredPlaces =

    category === "전체"

      ? places

      : category === null

        ? []

        : places.filter((item) =>

            item.type === category
          );


  // 길찾기 함수
  const handleRoute = async (item) => {

    const startX = myPosition[1];
    const startY = myPosition[0];

    const endX = item.lng;
    const endY = item.lat;

    try {

      const response = await axios.post(

        "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json",

        {
          startX,
          startY,

          endX,
          endY,

          startName: "현재 위치",
          endName: item.name,
        },

        {
          headers: {

            appKey: "X4XtmhJo2F5GfVgf9fuK718RCgpgziOi7mjyfgFX",
          },
        }
      );

      const features =
        response.data.features;

      const route = [];

      features.forEach((feature) => {

        const geometry =
          feature.geometry;

        if (
          geometry.type === "LineString"
        ) {

          geometry.coordinates.forEach(
            (coord) => {

              route.push([
                coord[1],
                coord[0],
              ]);
            }
          );
        }
      });

      setRoutePath(route);

      setSelectedPosition([
        item.lat,
        item.lng,
      ]);

    } catch (error) {

      console.log(error);
    }
  };


  return (

    <div className="mapContainer">

      {/* 왼쪽 메뉴 */}
      <SideMenu />


      {/* 가운데 */}
      <div className="centerBox">

        {/* 제목 */}
        <div className="topBox">

          <div className="titleBox">

            <h1>
              교내시설
            </h1>

            <p>
              평소 활동 경로와 교내시설을 확인해보세요.
            </p>

          </div>


          {/* 검색창 */}
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

            {/* 지도 타일 */}
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"

              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {/* 지도 이동 */}
            <MoveMap
              position={selectedPosition}
            />


            {/* 현재 위치 */}
            <CircleMarker

              center={myPosition}

              radius={10}

              pathOptions={{
                color: "blue",
                fillColor: "blue",
                fillOpacity: 0.7,
              }}
            >

              <Popup>
                현재 위치
              </Popup>

            </CircleMarker>


            {/* 길찾기 선 */}
            {

              routePath.length > 0 && (

                <Polyline

                  positions={routePath}

                  pathOptions={{
                    color: "blue",
                  }}
                />
              )
            }


            {/* 시설 마커 */}
            {filteredPlaces.map((item) => (

              <Marker

                key={item.id}

                position={[
                  item.lat,
                  item.lng,
                ]}
              >

                <Popup>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    {item.time}
                  </p>

                </Popup>

              </Marker>

            ))}

          </MapContainer>

        </div>

      </div>


      {/* 오른쪽 */}
      <div className="rightBox">

        <h1>
          {category}
        </h1>


        {/* 시설 리스트 */}
        <PlaceList

          places={places}

          category={category}

          setSelectedPosition={
            setSelectedPosition
          }

          handleRoute={
            handleRoute
          }
        />


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
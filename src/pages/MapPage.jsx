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


// 지도 이동
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

function RouteMap(props) {

  const { routePath } = props;

  const map = useMap();

  useEffect(() => {

    if (routePath.length >= 2) {

      map.fitBounds(routePath, {
        padding: [100, 100],
      });
    }

  }, [routePath]);

  return null;
}


function MapPage() {

  // 현재 카테고리
  const [category, setCategory] =
    useState("전체");


  // 검색어
  const [search, setSearch] =
    useState("");


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


  // 길찾기 경로
  const [
    routePath,
    setRoutePath,
  ] = useState([]);


  // 장소별 소요시간
  const [
    travelTimes,
    setTravelTimes,
  ] = useState({});

  useEffect(() => {

  const times = {};

  places.forEach((item) => {

    const distance = Math.sqrt(

      Math.pow(
        item.lat - myPosition[0],
        2
      ) +

      Math.pow(
        item.lng - myPosition[1],
        2
      )
    );

    times[item.id] = Math.max(
      1,
      Math.round(distance * 5000)
    );
  });

  setTravelTimes(times);

}, [myPosition]);
  

  // GPS 현재 위치
  useEffect(() => {

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setMyPosition([

          position.coords.latitude,

          position.coords.longitude,
        ]);
      },

      (error) => {

        console.log(error);
      }
    );

  }, []);


  // 카테고리 + 검색 필터
  const filteredPlaces =

  places.filter((item) => {

    // 카테고리 필터
    const matchCategory =

      category === "전체"

        ? true

        : category === null

          ? false

          : item.type === category;


    // 검색 필터
    const matchSearch =

      item.name.includes(search) ||

      item.building?.some((keyword) =>

        keyword.includes(search)
      );


    // 건물 데이터 처리
    const showBuilding =

      item.type !== "건물"

        ? true

        : search !== "";


    return (

      matchCategory &&
      matchSearch &&
      showBuilding
    );
  });


  // 길찾기 함수
const handleRoute = (item) => {

  const destinationPosition = [
    item.lat,
    item.lng,
  ];

  setRoutePath([
    myPosition,
    destinationPosition,
  ]);
};

const nextClass = "웹프로그래밍";
       


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

            value={search}

            onChange={(event) =>

              setSearch(event.target.value)
            }
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

            <RouteMap
              routePath={routePath}
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

          places={filteredPlaces}

          setSelectedPosition={
            setSelectedPosition
          }

          handleRoute={
            handleRoute
          }

          travelTimes={
            travelTimes
          }
        />

   
        {/* 다음 수업 */}
        <div className="nextClass">

         <h3>  다음 수업 {nextClass} </h3>

          <p>
            현재 위치에서 5분 소요
          </p>

        </div>

      </div>

    </div>
  );
}

export default MapPage;
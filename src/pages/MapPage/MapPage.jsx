import DashboardNav from "../../components/Dashboard/DashboardNav";
import DashboardLoginCard from "../../components/Dashboard/DashboardLoginCard";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from "react-leaflet";
import { mockCourses } from "../../lib/mock-data";
import "leaflet/dist/leaflet.css";
import "../Dashboard/Dashboard.css";
import "./MapPage.css";
import Category from "../../components/Map/Category";
import PlaceList from "../../components/Map/PlaceList";
import places from "../../data/places";
import { useState, useEffect } from "react";

// 시간계산
function formatTime(minutes) {

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) { 
    return `${hours}시간 ${mins}분`;}
  return `${mins}분`;
}

// 지도 이동
function MoveMap(props) {

  const { position } = props;
  const map = useMap();

  useEffect(() => { map.flyTo(position, 18); }, [position]);
  return null;
}

function RouteMap(props) {

  const { routePath } = props;
  const map = useMap();

  useEffect(() => {
    if (routePath.length >= 2) {
      map.fitBounds(routePath, { padding: [100, 100] });
    }}, [routePath]);
  return null;
}


function MapPage() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('lumos_user_info');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  // const [places, setPlaces] = useState([]); // 플레이스 리스트
  
  const [ category, setCategory] = useState("전체");   // 현재 카테고리
  const [ search, setSearch] = useState("");         // 검색어
  const [ selectedPosition, setSelectedPosition ] = useState([35.8532, 128.4913]); // 지도 중심 위치
  const [ myPosition, setMyPosition ] = useState([35.8532, 128.4913]); // 현재 내 위치
  const [ routePath, setRoutePath ] = useState([]); // 길찾기 경로
  const [ travelTimes, setTravelTimes ] = useState({}); // 장소별 소요시간
  const [selectedPlace, setSelectedPlace] = useState(null);
  

/* 
useEffect(() => {
  fetch("http://localhost:8080/api/places")
    .then((res) => res.json())
    .then((data) => {
      console.log("API 응답", data);
      setPlaces(data);
    });
}, []);
*/

  // 리스트 계산
  useEffect(() => {
    const times = {};
    places.forEach((item) => 
    { 
      const R = 6371e3;
      const lat1 = myPosition[0] * Math.PI / 180;
      const lat2 = item.lat * Math.PI / 180;
      const deltaLat = (item.lat - myPosition[0]) * Math.PI / 180;
      const deltaLng = (item.lng - myPosition[1]) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) *
                Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c;
      times[item.id] = Math.max(1, Math.round(distance / 50) );
    }); setTravelTimes(times);
  }, [myPosition]);
      
  // GPS 현재 위치
  useEffect(() => 
    { 
      navigator.geolocation.getCurrentPosition(
      (position) => { setMyPosition([ position.coords.latitude, position.coords.longitude,]);},
      (error) => {console.log(error);});
    }, []);


  // 카테고리 + 검색 필터
  const filteredPlaces = places.filter((item) => 
    {
      // 카테고리 필터
      const matchCategory = 
        category === "전체" ? true : category === null ? false : item.type === category;

      // 검색 필터
      const matchSearch =
        item.name.includes(search) || item.building?.includes(search);
  
      // 건물 데이터 처리
      const showBuilding = 
        item.type !== "건물" ? true : search !== "";
        
      return ( matchCategory && matchSearch && showBuilding );
    });


  // 길찾기 함수
    const handleRoute = (item) => {
      const destinationPosition = [item.lat, item.lng];

      setSelectedPlace(item);
      setRoutePath([myPosition, destinationPosition]);
    };

    const handleCancelRoute = () => {
      setRoutePath([]);
      setSelectedPlace(null);
    };
 
  /* 
  // 가장 가까운 수업 계산
  const now = new Date();
  const currentDay = now.getDay() - 1;
  const currentTime = now.getHours() * 60 + now.getMinutes();
  */

  
  // 일단 시간 월요일로 강제
  const currentDay = 0; // 월요일 강제
  const currentTime = 8 * 60; // 오전 8시 강제
 

  const todayCourses = mockCourses.filter((course) =>
    course.schedules.some( (schedule) => schedule.day === currentDay))
      .sort((a, b) => 
      {  
        const aTime = 
        Number( a.schedules.find((s) => s.day === currentDay)?.startTime.split(":")[0]) * 60 +
        Number(a.schedules.find((s) => s.day === currentDay)?.startTime.split(":")[1]);

        const bTime =
        Number( b.schedules.find((s) =>s.day === currentDay)?.startTime.split(":")[0]) * 60 +
        Number(b.schedules.find((s) => s.day === currentDay)?.startTime.split(":")[1]);
        return aTime - bTime;
      });

  const nextCourse = todayCourses.find((course) => 
  {
    const schedule = course.schedules.find((s) => s.day === currentDay);
    const startMinutes =
      Number(schedule.startTime.split(":")[0]) * 60 +
      Number(schedule.startTime.split(":")[1]);
    
    return startMinutes > currentTime;
  });

  const nextClass = nextCourse?.name || "오늘 수업 없음";
  const nextRoom = nextCourse?.room || "-";

  const roomToBuilding = {
    "공학관 101호": "공학 1호관", "공학관 202호": "공학 2호관", 
    "공학관 301호": "공학 3호관", "공학관 401호": "공학 4호관", };

  const buildingName = roomToBuilding[nextRoom];
  const buildingPlace = places.find((item) => item.type === "건물" && item.name === buildingName);
  
  let nextClassTime = "-";
  
  if (buildingPlace) {
    const R = 6371e3;
    const lat1 = myPosition[0] * Math.PI / 180;
    const lat2 = buildingPlace.lat * Math.PI / 180;
    const deltaLat =(buildingPlace.lat - myPosition[0]) * Math.PI / 180;
    const deltaLng = (buildingPlace.lng - myPosition[1]) * Math.PI / 180;
    
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) 
              * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // 도보 기준
   nextClassTime = Math.max(1, Math.round(distance / 50));
  }

  if (!user) {
    return (
      <div className="dashboardPage">
        <DashboardNav user={null} />
        <main className="dashboardMain">
          <div className="Dashboard">
            <div className="dashboardHeader">
              <div>
                <h1 className="dashboardTitle">교내시설</h1>
                <p className="dashboardSubtitle">필요한 교내시설을 확인해보세요</p>
              </div>
            </div>
            <DashboardLoginCard description="캠퍼스맵과 시설 정보를 확인하려면 로그인해주세요." />
          </div>
        </main>
      </div>
    );
  }


return (
  <>
    <DashboardNav user={user} onLogout={() => setUser(null)} />

    <div className="mapContainer">
      {/* 가운데 */} <div className="centerBox">
      {/* 제목 */} <div className="topBox">
        <div className="titleBox">
          <h1> 교내시설 </h1>
          <p> 필요한 교내시설을 확인해보세요. </p>
        </div>
      
      {/* 검색창 */}
        <input className="search" 
          placeholder="찾고 싶은 교내 시설"
          value={search} onChange={(event) => setSearch(event.target.value)} />

    </div>

      {/* 카테고리 */} <Category category={category} setCategory={setCategory}/>
      {/* 지도 */} <div className="mapBox">
        <MapContainer 
          center={[35.8532, 128.4913]} zoom={17} style={{ width: "100%", height: "100%"}}>
          {/* 지도 타일 */} <TileLayer attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          {/* 지도 이동 */} <MoveMap position={selectedPosition}/>
            <RouteMap routePath={routePath}/>
          {/* 현재 위치 */} 
            <CircleMarker center={myPosition} radius={10} 
              pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.7 }} >
              <Popup> 현재 위치 </Popup>
            </CircleMarker>


          {/* 길찾기 선 */} {routePath.length > 0 && (<Polyline positions={routePath} pathOptions={{ color: "blue"}}/>)}
          {/* 시설 마커 */} 
          {selectedPlace ? (
          <Marker position={[selectedPlace.lat, selectedPlace.lng]}>
          <Popup>{selectedPlace.name}</Popup> </Marker>) : (filteredPlaces.map((item) => (
          <Marker key={item.id} position={[item.lat, item.lng]}>
          <Popup> <h3>{item.name}</h3> <p>{item.time}</p> </Popup>
          </Marker>
          ))
        )} 


        </MapContainer>
      </div>
    </div>
    

    {/* 오른쪽 */} 
      <div className="rightBox">
        <div className="listHeader">
        <h1>{category}</h1>
        <button className="myLocationButton" onClick={() => setSelectedPosition(myPosition)}> 내 위치 </button></div>
      {/* 시설 리스트 */}
        <PlaceList places={filteredPlaces}
          setSelectedPosition={ setSelectedPosition }
          handleRoute={handleRoute}
          handleCancelRoute={handleCancelRoute}
          selectedPlace={selectedPlace}
          travelTimes={travelTimes}
        />
      
      {/* 다음 수업 */}
        <div className="nextClass">
          <h3>  다음 수업 | {nextClass} </h3>
          <p> {Number.isFinite(nextClassTime) ? `현재 위치에서 ${formatTime(nextClassTime)} 소요` : "오늘 남은 수업 없음"}</p>
        </div>
      </div>
    </div>
  </>
  );
}
export default MapPage;
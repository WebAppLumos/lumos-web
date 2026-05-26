import { MapContainer, TileLayer, Marker, Popup, useMap,} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import { useState } from "react";
import SideMenu from "../components/SideMenu";
import Category from "../components/Category";
import PlaceList from "../components/PlaceList";

function MoveMap(props) {

  const {
    position,
  } = props;

  const map = useMap();

  // 지도 이동
  map.flyTo(position, 18);

  return null;
}

function MapPage() {

  // 현재 선택된 카테고리
  const [category, setCategory] = useState("전체");

  // 임시 나의 위치
  const [selectedPosition, setSelectedPosition] =
  useState([35.8532, 128.4913]);

  const places = [
// 카페  
{ id: 1, name: "블루포트 공학관점", type: "카페", time: "09:00 - 19:00", lat: 35.85910891900613, lng: 128.48747324155707},
{ id: 2, name: "카페사월", type: "카페", time: "09:00 - 18:00", lat: 35.85672754000742, lng: 128.4898419543818},
{ id: 3, name: "카페ING 동산도서관점", type: "카페", time: "08:40 - 18:00", lat: 35.85639335738497, lng: 128.48772138401628},
{ id: 4, name: "피피커피", type: "카페", time: "08:30 - 19:00", lat: 35.85625408418409, lng: 128.48513954036963},
{ id: 5, name: "붐카페&코너베이커리", type: "카페", time: "09:00 - 19:00", lat: 35.85423022055133, lng: 128.4861118722504},
{ id: 6, name: "카페ING 동영관점", type: "카페", time: "08:30 - 16:15", lat: 35.85320516540829, lng: 128.48428844646253},
{ id: 7, name: "이디야커피 계명대명교생활관점", type: "카페", time: "07:50 - 21:00", lat: 35.85705832685428, lng: 128.4802146357763},

//서점
{ id: 8, name: "계명대 구내서점", type: "서점", time: "09:00 - 19:00", lat: 35.85423022055133, lng: 128.4861118722504},

//도서관
{ id: 9, name: "동산도서관", type: "도서관", time: "09:00 - 19:00", lat: 35.85640495369977, lng: 128.48714874254276},
{ id: 10, name: "의학도서관", type: "도서관", time: "08:30 - 22:00", lat: 35.85509916572842, lng: 128.4805102964029},

// 프린트
{ id: 11, name: "동산도서관 3F", type: "프린트", time: "09:00 - 19:00", lat: 35.85640495369977, lng: 128.48714874254276},
{ id: 12, name: "공대 1호관 2F", type: "프린트", time: "09:00 - 19:00", lat: 35.85913509095088, lng: 128.48754291875463},
{ id: 13, name: "구바 지하 1층", type: "프린트", time: "09:00 - 19:00", lat: 35.85639335738497, lng: 128.48772138401628},
{ id: 14, name: "의양관 지하 1층", type: "프린트", time: "09:00 - 19:00", lat: 35.856267774531446, lng: 128.4849433084449},
{ id: 15, name: "음대 1F", type: "프린트", time: "09:00 - 19:00", lat: 35.85829876580757, lng: 128.4904912789133},

// 학식당
{ id: 16, name: "구바우어관", type: "학식당", time: "09:00 - 19:00", lat: 35.85423022055133, lng: 128.4861118722504},
{ id: 17, name: "신바우어관", type: "학식당", time: "09:00 - 19:00", lat: 35.85393360912969, lng: 128.48550305451363},
{ id: 18, name: "공대학식당", type: "학식당", time: "09:00 - 19:00", lat: 35.858219287991645, lng: 128.4894519809646},
{ id: 19, name: "아람관", type: "학식당", time: "09:00 - 19:00", lat: 35.853956594358515, lng: 128.48291324663953},

// 편의점
{ id: 20, name: "CU 계명대명교생활관점", type: "편의점", time: "00:00 - 24:00", lat: 35.85705832685428, lng: 128.4802146357763},
{ id: 21, name: "이마트24 계명대공학관점", type: "편의점", time: "08:30 - 20:00", lat: 35.858219287991645, lng: 128.4894519809646},
{ id: 22, name: "CU 계명대의과대학점", type: "편의점", time: "09:00 - 18:00", lat: 35.85509916572842, lng: 128.4805102964029},
{ id: 23, name: "이마트24 R계명대바우어점", type: "편의점", time: "00:00 - 24:00", lat: 35.85423022055133, lng: 128.4861118722504},

];

const filteredPlaces =

  category === "전체"

    ? places

    : places.filter((item) =>

        item.type === category
      );


  return (

    <div className="mapContainer">

      {/* 왼쪽 메뉴 */}
      <SideMenu />



      {/* 가운데 영역 */}
      <div className="centerBox">

        {/* 제목 + 검색창 */}
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

            <MoveMap position={selectedPosition} />


            {/* 지도 마커 */}
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



      {/* 오른쪽 영역 */}
      <div className="rightBox">

        {/* 현재 카테고리 */}
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
// 시설 목록 컴포넌트

function PlaceList(props) {

  // 부모(MapPage)에서 전달받은 데이터
  const {
    showPlaces,
  } = props;

  return (

    <div className="placeList">

      {/* 시설 목록 출력 */}
      {showPlaces.map((item) => (

        <div
          className="placeBox"

          key={item.id}
        >

          <h3>
            {item.name}
          </h3>

          <p>
            {item.type}
          </p>

          <p>
            {item.time}
          </p>

        </div>

      ))}

    </div>
  );
}

export default PlaceList;
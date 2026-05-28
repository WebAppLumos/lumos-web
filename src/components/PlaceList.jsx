function PlaceList(props) {

  const {
    places,
    category,
    setSelectedPosition,
    handleRoute,
  } = props;


  // 카테고리 필터링
  const filteredPlaces =

    category === "전체"

      ? places

      : places.filter((item) =>

          item.type === category
        );


  return (

    <div className="placeList">

      {filteredPlaces.map((item) => (

        <div

          key={item.id}

          className="placeBox"

          onClick={() =>

            setSelectedPosition([
              item.lat,
              item.lng,
            ])
          }
        >

          <h3>
            {item.name}
          </h3>

          <p>
            {item.time}
          </p>


          {/* 길찾기 버튼 */}
          <button

            className="routeButton"

            onClick={(event) => {

              // 부모 클릭 막기
              event.stopPropagation();

              handleRoute(item);
            }}
          >

            길찾기

          </button>

        </div>

      ))}

    </div>
  );
}

export default PlaceList;
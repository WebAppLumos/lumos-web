function PlaceList(props) {

  // props 받기
  const {
    places,
    category,
    setSelectedPosition,
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
           
           <button

  className="routeButton"

  onClick={() =>

    window.open(
      `https://map.kakao.com/link/to/${item.name},${item.lat},${item.lng}`
    )
  }
>

  길찾기

</button>

        </div>

      ))}

    </div>
  );
}

export default PlaceList;
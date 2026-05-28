function PlaceList(props) {

  const {
    places,
    setSelectedPosition,
    handleRoute,
    travelTimes,
  } = props;


  return (

    <div className="placeList">

      {places.map((item) => (

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

            title={

              travelTimes[item.id]

                ? `현재 위치에서 약 ${travelTimes[item.id]}분`

                : "길찾기"
            }

            onClick={(event) => {

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
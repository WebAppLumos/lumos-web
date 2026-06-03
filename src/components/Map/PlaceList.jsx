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

          {

            item.time && (

              <p>
                {item.time}
              </p>
            )
          }

<div className="routeWrapper">

  <button

    className="routeButton"

    onClick={(event) => {

      event.stopPropagation();

      handleRoute(item);
    }}
  >

    길찾기

  </button>

 <span className="routeTooltip">

  {travelTimes[item.id]
    ? `현재 위치에서 약 ${travelTimes[item.id]}분`
    : "시간 계산 중..."}

</span>

</div>


        </div>

      ))}

    </div>
  );
}

export default PlaceList;
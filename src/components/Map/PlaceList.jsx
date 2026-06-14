function PlaceList(props) {

  const { places, setSelectedPosition, handleRoute, handleCancelRoute, selectedPlace, travelTimes } = props;
  return (
    <div className="placeList">
        {places.map((item) => (
          <div key={item.id} className="placeBox"
            onClick={() => setSelectedPosition([item.lat, item.lng])}>
          <h3> {item.name} </h3>

        { item.time && (<p> {item.time} </p> ) }

      <div className="routeWrapper">
        <button className="routeButton" onClick={(event) => { event.stopPropagation();
          if (selectedPlace?.id === item.id) { 
            handleCancelRoute();
          } else { handleRoute(item); } }}
>
  {selectedPlace?.id === item.id ? "길찾기 종료" : "길찾기"}
</button>
          
        <span className="routeTooltip">
          {travelTimes[item.id] ? travelTimes[item.id] >= 60
           ? `현재 위치에서 약 ${Math.floor(travelTimes[item.id] / 60)}시간 ${travelTimes[item.id] % 60}분`
          : `현재 위치에서 약 ${travelTimes[item.id]}분` : "시간 계산 중..."}
        </span>
        
      </div>
    </div> ))}
    </div>
  );
}
export default PlaceList;

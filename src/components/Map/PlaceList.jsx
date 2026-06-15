import { useEffect, useRef } from "react";

function PlaceList(props) {
  const {
    places,
    focusedPlaceId,
    onFocusPlace,
    handleRoute,
    handleCancelRoute,
    selectedPlace,
    travelTimes,
  } = props;

  const itemRefs = useRef({});

  useEffect(() => {
    if (!focusedPlaceId) return;

    const node = itemRefs.current[focusedPlaceId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusedPlaceId, places]);

  return (
    <div className="placeList">
      {places.map((item) => (
        <div
          key={item.id}
          ref={(node) => {
            if (node) {
              itemRefs.current[item.id] = node;
            } else {
              delete itemRefs.current[item.id];
            }
          }}
          className={`placeBox${focusedPlaceId === item.id ? " activePlace" : ""}`}
          onClick={() => onFocusPlace(item)}
        >
          <h3>{item.name}</h3>

          {item.floor && <p className="placeFloor">{item.floor}</p>}
          {item.time && <p>{item.time}</p>}
          {item.info && <p className="placeInfo">{item.info}</p>}

          <div className="routeWrapper">
            <button
              className="routeButton"
              onClick={(event) => {
                event.stopPropagation();
                if (selectedPlace?.id === item.id) {
                  handleCancelRoute();
                } else {
                  handleRoute(item);
                }
              }}
            >
              {selectedPlace?.id === item.id ? "길찾기 종료" : "길찾기"}
            </button>

            <span className="routeTooltip">
              {travelTimes[item.id]
                ? travelTimes[item.id] >= 60
                  ? `현재 위치에서 약 ${Math.floor(travelTimes[item.id] / 60)}시간 ${travelTimes[item.id] % 60}분`
                  : `현재 위치에서 약 ${travelTimes[item.id]}분`
                : "시간 계산 중..."}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PlaceList;

import "../Dashboard/Dashboard.css";
import "./MapPage.css";
import Category from "../../components/Map/Category";
import PlaceList from "../../components/Map/PlaceList";
import places from "../../data/places";
import { LocateFixed } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const KAKAO_MAP_APP_KEY =
  import.meta.env.VITE_KAKAO_MAP_APP_KEY ||
  "f45731d3a9216320487a08ab0fc72e69";

const DEFAULT_POSITION = [35.8532, 128.4913];
const RADIUS_OPTIONS = [100, 200, 300, 400];

function getPlaceFloor(place) {
  const floorText = place.floor || place.name.match(/(?:B\d+|지하\s*\d층|\d+\s*F|\d+\s*층)/i)?.[0];
  return floorText || "층 정보 확인 필요";
}

function getDistanceMeters(from, to) {
  const R = 6371e3;
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const deltaLat = ((to[0] - from[0]) * Math.PI) / 180;
  const deltaLng = ((to[1] - from[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getRoadRoutePath(origin, destination) {
  const params = new URLSearchParams({
    origin: `${origin[1]},${origin[0]}`,
    destination: `${destination[1]},${destination[0]}`,
    priority: "DISTANCE",
    alternatives: "false",
    road_details: "false",
  });

  const response = await fetch(`/kakao-mobility/v1/directions?${params}`);

  if (!response.ok) {
    throw new Error(`Route request failed: ${response.status}`);
  }

  const data = await response.json();
  const roads = data.routes?.[0]?.sections?.flatMap((section) => section.roads ?? []) ?? [];

  const path = roads.flatMap((road) => {
    const vertexes = road.vertexes ?? [];
    const points = [];

    for (let i = 0; i < vertexes.length; i += 2) {
      points.push([vertexes[i + 1], vertexes[i]]);
    }

    return points;
  });

  if (path.length < 2) {
    throw new Error("Route path is empty.");
  }

  return path;
}

function MapPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("q") ?? "";

  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState(initialSearch);
  const [selectedPosition, setSelectedPosition] = useState(DEFAULT_POSITION);
  const [myPosition, setMyPosition] = useState(DEFAULT_POSITION);
  const [radius, setRadius] = useState(400);
  const [routePath, setRoutePath] = useState([]);
  const [travelTimes, setTravelTimes] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [routeError, setRouteError] = useState("");

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const myPositionRef = useRef(DEFAULT_POSITION);
  const markers = useRef([]);
  const infowindows = useRef([]);
  const placeOverlays = useRef([]);
  const myPosMarker = useRef(null);
  const radiusCircle = useRef(null);
  const polyline = useRef(null);

  const moveToMyLocation = useCallback(() => {
    const moveMap = (position) => {
      setMyPosition(position);
      setSelectedPosition(position);
      setSelectedPlace(null);
      setRoutePath([]);
      setRouteError("");
    };

    if (!navigator.geolocation) {
      moveMap(myPositionRef.current);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        moveMap([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.log(error);
        moveMap(myPositionRef.current);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      }
    );
  }, []);

  useEffect(() => {
    myPositionRef.current = myPosition;
  }, [myPosition]);

  useEffect(() => {
    if (!KAKAO_MAP_APP_KEY) {
      setMapError("Kakao JavaScript key is missing.");
      return;
    }

    let cancelled = false;

    const initializeMap = () => {
      if (cancelled || !mapContainer.current || !window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        if (cancelled || !mapContainer.current || mapInstance.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(DEFAULT_POSITION[0], DEFAULT_POSITION[1]),
          level: 4,
        };

        const map = new window.kakao.maps.Map(mapContainer.current, options);
        mapInstance.current = map;
        setMapReady(true);
        setMapError("");
      });
    };

    if (window.kakao?.maps) {
      initializeMap();
      return () => {
        cancelled = true;
      };
    }

    const scriptUrl = new URL("https://dapi.kakao.com/v2/maps/sdk.js");
    scriptUrl.searchParams.set("appkey", KAKAO_MAP_APP_KEY);
    scriptUrl.searchParams.set("autoload", "false");

    let script = document.querySelector("script[data-kakao-map-sdk]");

    const handleLoad = () => {
      script.dataset.loaded = "true";
      console.log("카카오맵 스크립트 로드 성공");
      initializeMap();
    };

    const handleError = () => {
      const message = `카카오맵 스크립트 로드 실패: ${window.location.origin} 을 Kakao Developers > 플랫폼 > Web 사이트 도메인에 등록했는지, JavaScript 키를 사용 중인지 확인하세요.`;
      console.error(message);
      setMapError(message);
    };

    if (!script) {
      script = document.createElement("script");
      script.async = true;
      script.dataset.kakaoMapSdk = "true";
      script.src = scriptUrl.toString();
      document.head.appendChild(script);
    }

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (script.dataset.loaded === "true") {
      initializeMap();
    }

    return () => {
      cancelled = true;
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    moveToMyLocation();
  }, [mapReady, moveToMyLocation]);

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !window.kakao?.maps || !selectedPosition) return;

    const moveLatLon = new window.kakao.maps.LatLng(
      selectedPosition[0],
      selectedPosition[1]
    );

    mapInstance.current.panTo(moveLatLon);
  }, [mapReady, selectedPosition]);

  const filteredPlaces = useMemo(() => {
    return places.filter((item) => {
      const matchCategory =
        category === "전체" ? true : category === null ? false : item.type === category;

      const matchSearch =
        item.name.includes(search) ||
        item.building?.some((keyword) => keyword.includes(search));

      const showBuilding = item.type !== "건물" ? true : search !== "";
      const matchRadius = getDistanceMeters(myPosition, [item.lat, item.lng]) <= radius;

      return matchCategory && matchSearch && showBuilding && matchRadius;
    });
  }, [category, myPosition, radius, search]);

  useEffect(() => {
    if (!mapReady || !mapInstance.current || !window.kakao?.maps) return;

    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    infowindows.current.forEach((infowindow) => infowindow.close());
    infowindows.current = [];

    placeOverlays.current.forEach((overlay) => overlay.setMap(null));
    placeOverlays.current = [];

    if (myPosMarker.current) {
      myPosMarker.current.setMap(null);
    }

    if (radiusCircle.current) {
      radiusCircle.current.setMap(null);
    }

    const myPositionLatLng = new window.kakao.maps.LatLng(myPosition[0], myPosition[1]);

    radiusCircle.current = new window.kakao.maps.Circle({
      center: myPositionLatLng,
      radius,
      strokeWeight: 2,
      strokeColor: "#2563eb",
      strokeOpacity: 0.85,
      strokeStyle: "solid",
      fillColor: "#60a5fa",
      fillOpacity: 0.16,
    });
    radiusCircle.current.setMap(mapInstance.current);

    myPosMarker.current = new window.kakao.maps.CustomOverlay({
      position: myPositionLatLng,
      yAnchor: 0.5,
      content: '<div class="myPositionMarker" aria-label="내 위치"></div>',
    });
    myPosMarker.current.setMap(mapInstance.current);

    if (selectedPlace) {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng),
        map: mapInstance.current,
      });

      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:8px;font-size:12px;"><strong>${selectedPlace.name}</strong><br/>${getPlaceFloor(selectedPlace)}</div>`,
      });

      infowindow.open(mapInstance.current, marker);

      markers.current.push(marker);
      infowindows.current.push(infowindow);
    } else {
      filteredPlaces.forEach((item) => {
        const position = new window.kakao.maps.LatLng(item.lat, item.lng);
        const marker = new window.kakao.maps.Marker({
          position,
          map: mapInstance.current,
        });

        const distance = Math.round(getDistanceMeters(myPosition, [item.lat, item.lng]));
        const floor = getPlaceFloor(item);
        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          yAnchor: 1.45,
          content: `
            <div class="placeMapLabel">
              <strong>${item.name}</strong>
              <span>${floor}</span>
              <em>${distance}m</em>
            </div>
          `,
        });

        overlay.setMap(mapInstance.current);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:8px;font-size:12px;"><strong>${item.name}</strong><br/>${floor}<br/>${
            item.time || ""
          }</div>`,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindows.current.forEach((info) => info.close());
          infowindow.open(mapInstance.current, marker);
        });

        markers.current.push(marker);
        infowindows.current.push(infowindow);
        placeOverlays.current.push(overlay);
      });
    }

    if (polyline.current) {
      polyline.current.setMap(null);
    }

    if (routePath.length > 0) {
      const path = routePath.map(
        (pos) => new window.kakao.maps.LatLng(pos[0], pos[1])
      );

      polyline.current = new window.kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.7,
        strokeStyle: "solid",
      });

      polyline.current.setMap(mapInstance.current);

      const bounds = new window.kakao.maps.LatLngBounds();
      path.forEach((pos) => bounds.extend(pos));
      mapInstance.current.setBounds(bounds);
    }
  }, [filteredPlaces, mapReady, myPosition, radius, routePath, selectedPlace]);

  useEffect(() => {
    const times = {};

    places.forEach((item) => {
      const distance = getDistanceMeters(myPosition, [item.lat, item.lng]);
      times[item.id] = Math.max(1, Math.round(distance / 80));
    });

    setTravelTimes(times);
  }, [myPosition]);

  const handleRoute = async (item) => {
    const destinationPosition = [item.lat, item.lng];

    setSelectedPlace(item);
    setSelectedPosition(destinationPosition);
    setRoutePath([]);
    setRouteError("");

    try {
      const roadPath = await getRoadRoutePath(myPosition, destinationPosition);
      setRoutePath(roadPath);
    } catch (error) {
      console.log(error);
      setSelectedPlace(null);
      setRouteError("길찾기에 실패했습니다. REST API 키와 카카오 모빌리티 API 사용 설정을 확인해주세요.");
    }
  };

  const handleCancelRoute = () => {
    setRoutePath([]);
    setSelectedPlace(null);
    setRouteError("");
  };

  return (
    <>
      <div className="mapContainer">
        <div className="centerBox">
          <div className="topBox">
            <div className="titleBox">
              <h1>교내시설</h1>
              <p>필요한 교내시설을 확인해보세요.</p>
            </div>

            <input
              className="search"
              placeholder="찾고 싶은 교내 시설"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Category category={category} setCategory={setCategory} />

          <div className="mapBox">
            <div className="mapCanvas" ref={mapContainer}></div>

            <div className="radiusSlideControl">
              <div className="radiusSlideHeader">
                <span>내 반경</span>
                <strong>{radius}m</strong>
              </div>
              <input
                className="radiusSlider"
                type="range"
                min={RADIUS_OPTIONS[0]}
                max={RADIUS_OPTIONS[RADIUS_OPTIONS.length - 1]}
                step="100"
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                aria-label="내 위치 반경"
              />
              <div className="radiusTicks">
                {RADIUS_OPTIONS.map((option) => (
                  <span key={option}>{option}</span>
                ))}
              </div>
            </div>

            <button
              className="myLocationButton"
              type="button"
              aria-label="내 위치로 이동"
              title="내 위치로 이동"
              onClick={moveToMyLocation}
            >
              <LocateFixed size={22} strokeWidth={2.2} />
            </button>

            {routeError && <div className="routeError">{routeError}</div>}
            {mapError && <div className="mapError">{mapError}</div>}
          </div>
        </div>

        <div className="rightBox">
          <h1>{category || "교내시설"}</h1>

          <PlaceList
            places={filteredPlaces}
            setSelectedPosition={setSelectedPosition}
            handleRoute={handleRoute}
            handleCancelRoute={handleCancelRoute}
            selectedPlace={selectedPlace}
            travelTimes={travelTimes}
          />
        </div>
      </div>
    </>
  );
}

export default MapPage;

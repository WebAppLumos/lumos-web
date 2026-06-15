import "../Dashboard/Dashboard.css";
import "./MapPage.css";
import Category from "../../components/Map/Category";
import PlaceList from "../../components/Map/PlaceList";
import places from "../../data/places";
import { LocateFixed } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

const DEFAULT_POSITION = [35.8532, 128.4913];
const CAMPUS_CENTER = DEFAULT_POSITION;
const CAMPUS_BOUND_METERS = 1200;
const RADIUS_MIN = 100;
const RADIUS_MAX = 1200;
const RADIUS_STEP = 100;
const RADIUS_TICK_LABELS = [100, 400, 700, 1000, 1200];
const DEFAULT_RADIUS = 800;

const PLACE_TYPE_CLASS = {
  카페: "placeMapLabel-cafe",
  학식당: "placeMapLabel-canteen",
  편의점: "placeMapLabel-store",
  서점: "placeMapLabel-book",
  기숙사: "placeMapLabel-dorm",
  PC실습실: "placeMapLabel-pc",
  은행: "placeMapLabel-bank",
  생활편의: "placeMapLabel-life",
  도서관: "placeMapLabel-library",
  프린트: "placeMapLabel-print",
};

function normalizeSearchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
}

function matchesPlaceSearch(item, rawSearch) {
  const query = normalizeSearchText(rawSearch);
  if (!query) return true;

  const fields = [
    item.name,
    item.type,
    item.floor,
    item.info,
    ...(item.building ?? []),
  ];

  return fields.some((field) => normalizeSearchText(field).includes(query));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getPlaceTypeClass(type) {
  return PLACE_TYPE_CLASS[type] || "placeMapLabel-default";
}

function buildPlaceMapLabelHtml(place, distance, isFocused = false) {
  const typeClass = getPlaceTypeClass(place.type);
  const focusedClass = isFocused ? " is-focused" : "";
  const floor = escapeHtml(getPlaceFloor(place));

  return `
    <div class="placeMapLabel ${typeClass}${focusedClass}">
      <strong class="placeMapLabel-name">${escapeHtml(place.name)}</strong>
      <span class="placeMapLabel-meta">${floor} · ${distance}m</span>
    </div>
  `;
}

function buildPlaceMapPopupHtml(place) {
  const popupTypeClass = getPlaceTypeClass(place.type).replace("placeMapLabel", "placeMapPopup");

  return `
    <div class="placeMapPopup ${popupTypeClass}">
      <div class="placeMapPopup-header">
        <span class="placeMapPopup-type">${escapeHtml(place.type)}</span>
        <strong class="placeMapPopup-name">${escapeHtml(place.name)}</strong>
      </div>
      <div class="placeMapPopup-body">
        <p class="placeMapPopup-row">
          <span class="placeMapPopup-label">위치</span>
          <span class="placeMapPopup-value">${escapeHtml(getPlaceFloor(place))}</span>
        </p>
        ${
          place.time
            ? `<p class="placeMapPopup-row">
                <span class="placeMapPopup-label">운영</span>
                <span class="placeMapPopup-value">${escapeHtml(place.time)}</span>
              </p>`
            : ""
        }
        ${
          place.info
            ? `<p class="placeMapPopup-row placeMapPopup-row-info">
                <span class="placeMapPopup-label">안내</span>
                <span class="placeMapPopup-value">${escapeHtml(place.info)}</span>
              </p>`
            : ""
        }
      </div>
    </div>
  `;
}
function getPlaceFloor(place) {
  if (place.floor) return place.floor;
  const floorText = place.name.match(/(?:B\d+|지하\s*\d층|\d+\s*F|\d+\s*층)/i)?.[0];
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

function isOnCampus(position) {
  return getDistanceMeters(CAMPUS_CENTER, position) <= CAMPUS_BOUND_METERS;
}

function getLocationErrorMessage(error) {
  switch (error?.code) {
    case 1:
      return "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 접근을 허용해주세요.";
    case 2:
      return "현재 위치를 확인할 수 없습니다.";
    case 3:
      return "위치 요청 시간이 초과되었습니다. 다시 시도해주세요.";
    default:
      return "내 위치를 불러오지 못했습니다.";
  }
}

function requestCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function fetchUserLocation() {
  try {
    return await requestCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  } catch {
    return requestCurrentPosition({
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });
  }
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
  const [gpsPosition, setGpsPosition] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [routePath, setRoutePath] = useState([]);
  const [travelTimes, setTravelTimes] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [focusedPlaceId, setFocusedPlaceId] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [routeError, setRouteError] = useState("");
  const [locationError, setLocationError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const myPosition = gpsPosition ?? CAMPUS_CENTER;

  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markers = useRef([]);
  const infowindows = useRef([]);
  const placeOverlays = useRef([]);
  const myPosMarker = useRef(null);
  const radiusCircle = useRef(null);
  const polyline = useRef(null);

  const panMapTo = useCallback((position, zoomLevel = 3) => {
    if (!mapInstance.current || !window.kakao?.maps) return;

    const latLng = new window.kakao.maps.LatLng(position[0], position[1]);
    mapInstance.current.panTo(latLng);
    mapInstance.current.setLevel(zoomLevel);
  }, []);

  const moveToMyLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationError("");
    setSelectedPlace(null);
    setFocusedPlaceId(null);
    setRoutePath([]);
    setRouteError("");

    if (!navigator.geolocation) {
      setGpsPosition(null);
      setLocationError("이 브라우저에서는 위치 서비스를 사용할 수 없습니다.");
      panMapTo(CAMPUS_CENTER);
      setSelectedPosition(CAMPUS_CENTER);
      setIsLocating(false);
      return;
    }

    try {
      const position = await fetchUserLocation();
      const nextGpsPosition = [position.coords.latitude, position.coords.longitude];

      setGpsPosition(nextGpsPosition);
      panMapTo(nextGpsPosition);
      setSelectedPosition(nextGpsPosition);

      if (!isOnCampus(nextGpsPosition)) {
        setLocationError("캠퍼스 밖에 있습니다. 지도는 내 위치 기준으로 이동합니다.");
      }
    } catch (error) {
      console.log(error);
      setGpsPosition(null);
      setLocationError(getLocationErrorMessage(error));
      panMapTo(CAMPUS_CENTER);
      setSelectedPosition(CAMPUS_CENTER);
    } finally {
      setIsLocating(false);
    }
  }, [panMapTo]);

  useEffect(() => {
    const nextSearch = searchParams.get("q") ?? "";
    setSearch(nextSearch);
  }, [searchParams]);

  useEffect(() => {
    if (!KAKAO_MAP_APP_KEY) {
      setMapError("VITE_KAKAO_MAP_APP_KEY 환경 변수가 설정되지 않았습니다.");
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

  const trimmedSearch = search.trim();

  const listPlaces = useMemo(() => {
    return places.filter((item) => {
      const matchCategory =
        !category || category === "전체" ? true : item.type === category;

      const matchSearch = matchesPlaceSearch(item, trimmedSearch);

      const showBuilding = item.type !== "건물" ? true : trimmedSearch !== "";

      return matchCategory && matchSearch && showBuilding;
    });
  }, [category, trimmedSearch]);

  const mapPlaces = useMemo(() => {
    if (trimmedSearch) {
      return listPlaces;
    }

    return listPlaces.filter(
      (item) => getDistanceMeters(myPosition, [item.lat, item.lng]) <= radius
    );
  }, [listPlaces, myPosition, radius, trimmedSearch]);

  useEffect(() => {
    const query = (searchParams.get("q") ?? "").trim();
    if (!query) return;

    const matches = places.filter((item) => matchesPlaceSearch(item, query));
    if (matches.length === 0) return;

    const firstPlace = matches[0];
    setFocusedPlaceId(firstPlace.id);
    setSelectedPosition([firstPlace.lat, firstPlace.lng]);
  }, [searchParams]);

  useEffect(() => {
    if (focusedPlaceId && !listPlaces.some((item) => item.id === focusedPlaceId)) {
      setFocusedPlaceId(null);
    }
  }, [focusedPlaceId, listPlaces]);

  const handleFocusPlace = useCallback((place) => {
    setFocusedPlaceId(place.id);
    setSelectedPosition([place.lat, place.lng]);
  }, []);

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
        content: buildPlaceMapPopupHtml(selectedPlace),
      });

      infowindow.open(mapInstance.current, marker);

      markers.current.push(marker);
      infowindows.current.push(infowindow);
    } else {
      mapPlaces.forEach((item) => {
        const position = new window.kakao.maps.LatLng(item.lat, item.lng);
        const marker = new window.kakao.maps.Marker({
          position,
          map: mapInstance.current,
        });

        const distance = Math.round(getDistanceMeters(myPosition, [item.lat, item.lng]));
        const isFocused = focusedPlaceId === item.id;
        const overlay = new window.kakao.maps.CustomOverlay({
          position,
          yAnchor: 1.35,
          content: buildPlaceMapLabelHtml(item, distance, isFocused),
        });

        overlay.setMap(mapInstance.current);

        const infowindow = new window.kakao.maps.InfoWindow({
          content: buildPlaceMapPopupHtml(item),
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          infowindows.current.forEach((info) => info.close());
          infowindow.open(mapInstance.current, marker);
          setFocusedPlaceId(item.id);
          setSelectedPosition([item.lat, item.lng]);
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
  }, [focusedPlaceId, mapPlaces, mapReady, myPosition, radius, routePath, selectedPlace]);

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
    setFocusedPlaceId(item.id);
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
                min={RADIUS_MIN}
                max={RADIUS_MAX}
                step={RADIUS_STEP}
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                aria-label="내 위치 반경"
              />
              <div className="radiusTicks">
                {RADIUS_TICK_LABELS.map((option) => (
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
              disabled={isLocating}
            >
              <LocateFixed size={22} strokeWidth={2.2} />
            </button>

            {locationError && <div className="locationError">{locationError}</div>}
            {routeError && <div className="routeError">{routeError}</div>}
            {mapError && <div className="mapError">{mapError}</div>}
          </div>
        </div>

        <div className="rightBox">
          <h1>{category || "교내시설"}</h1>

          <PlaceList
            places={listPlaces}
            focusedPlaceId={focusedPlaceId}
            onFocusPlace={handleFocusPlace}
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

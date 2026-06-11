(function () {
  const mapEl = document.getElementById("yandex-map");
  const contactsSection = document.getElementById("contacts");
  if (!mapEl || typeof LEGION_BRANCHES === "undefined") return;

  const apiKey = mapEl.dataset.apiKey || "";
  let mapInstance = null;
  let mapInitialized = false;

  function buildWidgetUrl() {
    const lats = LEGION_BRANCHES.map((b) => b.coords[0]);
    const lons = LEGION_BRANCHES.map((b) => b.coords[1]);
    const centerLat = lats.reduce((sum, v) => sum + v, 0) / lats.length;
    const centerLon = lons.reduce((sum, v) => sum + v, 0) / lons.length;
    const params = new URLSearchParams({
      ll: `${centerLon},${centerLat}`,
      z: "10",
      lang: "ru_RU",
    });

    LEGION_BRANCHES.forEach((branch) => {
      params.append("pt", `${branch.coords[1]},${branch.coords[0]},pm2rdm`);
    });

    return `https://yandex.ru/map-widget/v1/?${params.toString()}`;
  }

  function showWidgetFallback() {
    mapEl.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = buildWidgetUrl();
    iframe.title = "Карта филиалов СК «Легион»";
    iframe.loading = "lazy";
    iframe.allowFullscreen = true;
    mapEl.appendChild(iframe);
  }

  function loadYandexApi(key) {
    return new Promise((resolve, reject) => {
      if (window.ymaps) {
        window.ymaps.ready(resolve);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(key)}&lang=ru_RU`;
      script.async = true;
      script.onload = () => window.ymaps.ready(resolve);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function fitMap() {
    if (!mapInstance) return;
    mapInstance.container.fitToViewport();
  }

  function initInteractiveMap() {
    if (mapInitialized) {
      fitMap();
      return;
    }

    mapInitialized = true;

    const placemarks = LEGION_BRANCHES.map(
      (branch) =>
        new window.ymaps.Placemark(
          branch.coords,
          {
            balloonContentHeader: branch.title,
            balloonContentBody: branch.address,
            hintContent: branch.title,
          },
          {
            preset: "islands#redDotIcon",
          }
        )
    );

    const clusterer = new window.ymaps.Clusterer({
      preset: "islands#redClusterIcons",
      groupByCoordinates: false,
      clusterDisableClickZoom: false,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
    });

    clusterer.add(placemarks);

    mapInstance = new window.ymaps.Map(
      "yandex-map",
      {
        center: LEGION_BRANCHES[0].coords,
        zoom: 10,
        controls: ["zoomControl", "fullscreenControl"],
      },
      {
        suppressMapOpenBlock: true,
      }
    );

    mapInstance.geoObjects.add(clusterer);

    const bounds = clusterer.getBounds();
    if (bounds) {
      mapInstance.setBounds(bounds, {
        checkZoomRange: true,
        zoomMargin: 50,
      });
    }

    window.addEventListener("resize", fitMap);
    setTimeout(fitMap, 0);
    setTimeout(fitMap, 300);
  }

  function startMap() {
    if (!apiKey) {
      showWidgetFallback();
      return;
    }

    loadYandexApi(apiKey)
      .then(initInteractiveMap)
      .catch(() => showWidgetFallback());
  }

  if (contactsSection && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          obs.disconnect();
          startMap();
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(contactsSection);

    contactsSection.addEventListener(
      "transitionend",
      (event) => {
        if (event.propertyName === "opacity") {
          fitMap();
        }
      },
      { passive: true }
    );
  } else {
    startMap();
  }
})();

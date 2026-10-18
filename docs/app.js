(() => {
  const $ = (id) => document.getElementById(id);
  const KEY = 'flyertrack-lite-v1';
  let state = load();            // { zone: [[lat,lng],...], points: [{lat,lng}] }
  let drawing = false, watchId = null, replay = null;

  const map = L.map('map').setView([-33.8955, 151.176], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  const zoneLayer = L.layerGroup().addTo(map), trackLayer = L.layerGroup().addTo(map);

  // ---------- geo maths (same idea as the Python/Azure design: grid sampling) ----------
  const rad = (d) => d * Math.PI / 180;
  function dist(a, b, c, d) { // haversine, metres
    const x = Math.sin(rad(c - a) / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(rad(d - b) / 2) ** 2;
    return 12742000 * Math.asin(Math.sqrt(x));
  }
  function inside(lat, lng, ring) {
    let in_ = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [yi, xi] = ring[i], [yj, xj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) in_ = !in_;
    }
    return in_;
  }
  function coverage(ring, pts, cell = 20, radius = 25) {
    if (ring.length < 3) return 0;
    const lats = ring.map((p) => p[0]), lngs = ring.map((p) => p[1]);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const dLat = cell / 111320, dLng = cell / (111320 * Math.cos(rad((minLat + maxLat) / 2)));
    let total = 0, hit = 0;
    for (let lat = minLat + dLat / 2; lat < maxLat; lat += dLat)
      for (let lng = minLng + dLng / 2; lng < maxLng; lng += dLng) {
        if (!inside(lat, lng, ring)) continue;
        total++;
        if (pts.some((p) => dist(lat, lng, p.lat, p.lng) <= radius)) hit++;
      }
    return total ? Math.round(hit / total * 1000) / 10 : 0;
  }

  // ---------- state ----------
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || { zone: [], points: [] }; } catch { return { zone: [], points: [] }; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked: demo still works */ } }
  const say = (m) => { $('status').textContent = m; };

  function render() {
    zoneLayer.clearLayers(); trackLayer.clearLayers();
    state.zone.forEach((p) => L.circleMarker(p, { radius: 4, color: '#d64545' }).addTo(zoneLayer));
    if (state.zone.length >= 3) L.polygon(state.zone, { color: '#d64545', weight: 2, fillOpacity: 0.12 }).addTo(zoneLayer);
    if (state.points.length > 1) L.polyline(state.points.map((p) => [p.lat, p.lng]), { color: '#0e9f8e', weight: 4 }).addTo(trackLayer);
    const last = state.points[state.points.length - 1];
    if (last) L.circleMarker([last.lat, last.lng], { radius: 8, color: '#14213d', weight: 2, fillColor: '#ffc93c', fillOpacity: 1 }).addTo(trackLayer);
    const pct = coverage(state.zone, state.points);
    $('pct').textContent = pct + '%'; $('bar').style.width = pct + '%';
    $('count').textContent = state.points.length + ' GPS points';
  }

  // ---------- actions ----------
  map.on('click', (e) => { if (!drawing) return; state.zone.push([e.latlng.lat, e.latlng.lng]); save(); render(); });

  $('draw').addEventListener('click', () => {
    drawing = !drawing;
    $('draw').classList.toggle('active', drawing);
    $('draw').textContent = drawing ? 'Finish zone' : 'Draw zone';
    if (drawing) { state.zone = []; state.points = []; save(); render(); say('Click 3 or more points on the map.'); }
    else say(state.zone.length < 3 ? 'A zone needs at least 3 points.' : 'Zone saved. Press Start GPS.');
  });

  $('sample').addEventListener('click', async () => {
    try {
      const data = await (await fetch('sample-walk.json')).json();
      clearInterval(replay); state = { zone: data.zone, points: [] }; render();
      map.fitBounds(data.zone, { padding: [30, 30] });
      let i = 0; say('Replaying walk…');
      replay = setInterval(() => {
        if (i >= data.walk.length) { clearInterval(replay); say('Replay finished.'); return; }
        state.points.push(data.walk[i++]); render();
      }, 40);
    } catch (e) { say('Could not load sample data.'); }
  });

  $('start').addEventListener('click', () => {
    if (state.zone.length < 3) return say('Draw a zone first.');
    if (!navigator.geolocation) return say('This browser has no GPS.');
    watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      if (accuracy > 50) return say('Waiting for a better GPS signal (±' + Math.round(accuracy) + ' m)…');
      const last = state.points[state.points.length - 1];
      if (!last || dist(last.lat, last.lng, lat, lng) > 5) { state.points.push({ lat, lng }); save(); render(); }
      say('Tracking · accuracy ±' + Math.round(accuracy) + ' m');
    }, (err) => say(err.code === 1 ? 'Location blocked. Allow it for this site.' : err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    $('start').disabled = true; $('stop').disabled = false; say('Waiting for GPS fix…');
  });

  $('stop').addEventListener('click', () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null; $('start').disabled = false; $('stop').disabled = true; say('Stopped.');
  });

  $('reset').addEventListener('click', () => { clearInterval(replay); state = { zone: [], points: [] }; save(); render(); say('Reset.'); });

  render();
  if (state.zone.length >= 3) map.fitBounds(state.zone, { padding: [30, 30] });
})();

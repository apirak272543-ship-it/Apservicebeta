(function () {
  'use strict';

  const providers = [
    { label: 'OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', options: { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' } },
    { label: 'Carto', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', options: { maxZoom: 20, attribution: '&copy; OpenStreetMap &copy; CARTO' } },
    { label: 'ภาพถ่ายดาวเทียม', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', options: { maxZoom: 19, attribution: 'Tiles &copy; Esri' } },
  ];

  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  function pointFromInputs(latInput, lngInput) {
    const lat = Number(latInput.value), lng = Number(lngInput.value);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 ? [lat, lng] : null;
  }

  function mountPicker(form) {
    if (form.dataset.locationPickerReady === 'true' || !window.L) return;
    const latInput = form.elements.location_lat, lngInput = form.elements.location_lng;
    if (!latInput || !lngInput) return;
    const referencePoint = pointFromInputs(latInput, lngInput) || [13.7563, 100.5018];
    const grid = lngInput.closest('.admin-form-grid') || latInput.closest('.admin-form-grid');
    if (!grid) return;
    form.dataset.locationPickerReady = 'true';
    const picker = document.createElement('section');
    picker.className = 'admin-store-location-picker';
    picker.dataset.storeLocationPicker = 'true';
    picker.innerHTML = `<div class="admin-store-location-picker__head"><div><h4>เลือกตำแหน่งร้านบนแผนที่</h4><p>แตะแผนที่ ค้นหาสถานที่ หรือใช้ตำแหน่งปัจจุบัน แล้วระบบจะกรอกพิกัดให้โดยอัตโนมัติ</p></div><span class="mpa-badge">ไม่บังคับ</span></div><div class="admin-store-location-picker__search"><input type="search" data-location-search placeholder="ค้นหาชื่อสถานที่หรือที่อยู่"><button type="button" class="mpa-button mpa-button-secondary" data-location-search-button>ค้นหา</button></div><div class="admin-store-location-picker__actions"><button type="button" class="mpa-button mpa-button-secondary" data-location-gps>ใช้ GPS</button><button type="button" class="mpa-button mpa-button-secondary" data-location-source>สลับแหล่งภาพ</button><button type="button" class="mpa-button mpa-button-secondary" data-location-retry>ลองใหม่</button></div><div class="admin-store-location-map" data-location-map aria-label="แผนที่สำหรับเลือกตำแหน่งร้าน"></div><p class="admin-store-location-status" data-location-status>แตะบนแผนที่เพื่อปักหมุดตำแหน่งร้าน</p>`;
    grid.after(picker);

    const mapElement = picker.querySelector('[data-location-map]');
    const status = picker.querySelector('[data-location-status]');
    const sourceButton = picker.querySelector('[data-location-source]');
    const searchInput = picker.querySelector('[data-location-search]');
    let providerIndex = 0;
    let marker;
    let tiles;
    const map = L.map(mapElement, { zoomControl: true, scrollWheelZoom: false }).setView(referencePoint, pointFromInputs(latInput, lngInput) ? 15 : 11);

    function setStatus(message, isError) {
      status.textContent = message;
      status.style.color = isError ? '#b42318' : '#42615b';
    }

    function applyProvider(index) {
      providerIndex = (index + providers.length) % providers.length;
      if (tiles) map.removeLayer(tiles);
      const provider = providers[providerIndex];
      tiles = L.tileLayer(provider.url, provider.options).addTo(map);
      tiles.on('tileerror', () => setStatus(`แผนที่จาก ${provider.label} โหลดไม่ครบ ลองกด “สลับแหล่งภาพ” หรือ “ลองใหม่”`, true));
      sourceButton.textContent = `แหล่งภาพ: ${provider.label}`;
    }

    function setPoint(lat, lng, label) {
      const point = [Number(lat), Number(lng)];
      if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) return;
      latInput.value = point[0].toFixed(6);
      lngInput.value = point[1].toFixed(6);
      latInput.dispatchEvent(new Event('input', { bubbles: true }));
      lngInput.dispatchEvent(new Event('input', { bubbles: true }));
      if (!marker) marker = L.marker(point, { draggable: true }).addTo(map);
      else marker.setLatLng(point);
      marker.on('dragend', event => { const next = event.target.getLatLng(); setPoint(next.lat, next.lng, 'ย้ายหมุดแล้ว'); });
      map.setView(point, Math.max(map.getZoom(), 15));
      setStatus(`${label || 'เลือกตำแหน่งแล้ว'}: ${point[0].toFixed(6)}, ${point[1].toFixed(6)}`);
    }

    applyProvider(providerIndex);
    if (pointFromInputs(latInput, lngInput)) setPoint(...pointFromInputs(latInput, lngInput), 'ใช้พิกัดเดิม');
    map.on('click', event => setPoint(event.latlng.lat, event.latlng.lng, 'เลือกตำแหน่งจากแผนที่แล้ว'));
    setTimeout(() => map.invalidateSize(), 50);

    picker.querySelector('[data-location-gps]').onclick = () => {
      if (!navigator.geolocation) return setStatus('เบราว์เซอร์นี้ไม่รองรับการขอตำแหน่ง GPS', true);
      setStatus('กำลังขอตำแหน่งจากอุปกรณ์…');
      navigator.geolocation.getCurrentPosition(position => setPoint(position.coords.latitude, position.coords.longitude, 'ใช้ตำแหน่ง GPS แล้ว'), error => {
        const messages = { 1: 'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง GPS', 2: 'อุปกรณ์ระบุตำแหน่งไม่ได้', 3: 'ใช้เวลาค้นหาตำแหน่งนานเกินไป' };
        setStatus(messages[error.code] || 'ไม่สามารถใช้ตำแหน่ง GPS ได้', true);
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 });
    };

    sourceButton.onclick = () => { applyProvider(providerIndex + 1); setStatus(`สลับเป็น ${providers[providerIndex].label} แล้ว`); };
    picker.querySelector('[data-location-retry]').onclick = () => { const center = map.getCenter(); applyProvider(providerIndex); map.setView(center, map.getZoom()); setTimeout(() => map.invalidateSize(), 50); setStatus(`กำลังลองโหลด ${providers[providerIndex].label} ใหม่…`); };

    async function searchLocation() {
      const query = searchInput.value.trim();
      if (query.length < 2) return setStatus('กรุณาระบุชื่อสถานที่หรือที่อยู่ที่ต้องการค้นหา', true);
      setStatus('กำลังค้นหาสถานที่…');
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=th&q=${encodeURIComponent(query)}`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('search failed');
        const [result] = await response.json();
        if (!result) return setStatus('ไม่พบสถานที่นี้ ลองระบุอำเภอ จังหวัด หรือใช้การปักหมุดบนแผนที่', true);
        setPoint(result.lat, result.lon, `พบ: ${escapeText(result.display_name).replace(/&[^;]+;/g, '')}`);
      } catch (_) { setStatus('ค้นหาสถานที่ไม่สำเร็จ กรุณาลองใหม่หรือปักหมุดบนแผนที่', true); }
    }
    picker.querySelector('[data-location-search-button]').onclick = searchLocation;
    searchInput.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); searchLocation(); } });
  }

  function scan() {
    document.querySelectorAll('form[data-store-form], form[data-form]').forEach(form => {
      if (form.elements.location_lat && form.elements.location_lng) mountPicker(form);
    });
  }
  function start() {
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { childList: true, subtree: true });
    let retries = 0;
    const retryTimer = window.setInterval(() => {
      scan();
      if (document.querySelector('[data-store-location-picker]') || ++retries >= 80) window.clearInterval(retryTimer);
    }, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
}());

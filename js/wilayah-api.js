/* ====================================================================
   WILAYAH-API.JS (v3 - Final)
   Patch: EMSIFA → ihsaninh.github.io/wilayah-indonesia
   Struktur: {id: number, value: string}
   ==================================================================== */
(function(){
  'use strict';

  const NEW_BASE = 'https://ihsaninh.github.io/wilayah-indonesia';

  // ---------- HELPER ----------
  function titleCase(str){
    return String(str||'').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  // Normalisasi item → format EMSIFA {id, name}
  // API baru pakai field "value", bukan "name"
  function normalizeItem(item){
    return {
      id:   String(item.id),              // jadikan string agar konsisten
      name: titleCase(item.value || item.name || '')
    };
  }

  async function fetchJSON(url){
    const res = await fetch(url, { cache: 'force-cache' });
    if(!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
    const json = await res.json();
    const arr = Array.isArray(json) ? json : (json.data || []);
    return arr.map(normalizeItem);
  }

// ---------- KONVERSI URL EMSIFA → ENDPOINT BARU ----------
function emsifaToNew(emsifaUrl){
  if(!emsifaUrl || typeof emsifaUrl !== 'string') return null;
  if(!emsifaUrl.includes('emsifa.com')) return null;
  try{
    const u = new URL(emsifaUrl);
    const p = u.pathname.replace('/api-wilayah-indonesia/api/', '');

    // provinces.json
    if(p === 'provinces.json') return `${NEW_BASE}/provinces.json`;

    // regencies/{provId}.json
    let m = p.match(/^regencies\/(\d+)\.json$/);
    if(m) return `${NEW_BASE}/${m[1]}/regencies.json`;

    // districts/{kabId}.json
    // Terima format: "3328" (4 digit) atau "33.28" (dengan titik)
    m = p.match(/^districts\/(\d{2})\.?(\d{2})\.json$/);
    if(m){
      const prov = m[1];
      const kab  = m[1] + m[2];
      return `${NEW_BASE}/${prov}/${kab}/district.json`;
    }

    // villages/{kecId}.json
    // Terima format: "3328.06" (dengan titik) ATAU "332806" (tanpa titik)
    m = p.match(/^villages\/(\d{2})\.?(\d{2})\.?(\d{2})\.json$/);
    if(m){
      const prov = m[1];
      const kab  = m[1] + m[2];
      const kec  = m[1] + m[2] + m[3];
      return `${NEW_BASE}/${prov}/${kab}/${kec}/subdistrict.json`;
    }

    return null;
  }catch(e){
    return null;
  }
}

  // ---------- PATCH GLOBAL fetch ----------
  const _origFetch = window.fetch.bind(window);

  window.fetch = async function(input, init){
    const url = typeof input === 'string' ? input : (input && input.url);
    const newUrl = emsifaToNew(url);

    // Bukan URL EMSIFA → teruskan
    if(!newUrl){
      return _origFetch(input, init);
    }

    // --- Alihkan ke API baru ---
    try{
      const data = await fetchJSON(newUrl);
      return new Response(JSON.stringify(data), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }catch(err){
      console.warn('[wilayah-api] Gagal fetch API baru, fallback ke EMSIFA:', err.message);
      try{
        return await _origFetch(input, init);
      }catch(e2){
        return new Response(JSON.stringify({ error: e2.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  };

  // ---------- DEBUG HELPER ----------
  window.WilayahAPI = {
    BASE: NEW_BASE,
    test: async function(){
      try{
        const p = await fetchJSON(`${NEW_BASE}/provinces.json`);
        console.log('✅ Provinsi:', p.length);
        const jt = p.find(x => /jawa tengah/i.test(x.name));
        if(!jt) return console.warn('❌ Jawa Tengah tidak ditemukan');
        console.log('   Jawa Tengah ID:', jt.id);

        const k = await fetchJSON(`${NEW_BASE}/${jt.id}/regencies.json`);
        console.log('✅ Kab. Jateng:', k.length);
        const tegal = k.find(x => /^tegal$/i.test(x.name));
        if(!tegal) return console.warn('❌ Kab. Tegal tidak ditemukan');
        console.log('   Kab. Tegal ID:', tegal.id);

        const kec = await fetchJSON(`${NEW_BASE}/${jt.id}/${tegal.id}/district.json`);
        console.log('✅ Kec. Tegal:', kec.length);
        const lebaksiu = kec.find(x => /lebaksiu/i.test(x.name));
        if(!lebaksiu) return console.warn('❌ Kec. Lebaksiu tidak ditemukan');
        console.log('   Kec. Lebaksiu ID:', lebaksiu.id);

        const desa = await fetchJSON(`${NEW_BASE}/${jt.id}/${tegal.id}/${lebaksiu.id}/subdistrict.json`);
        console.log('✅ Desa Lebaksiu:', desa.length, desa.slice(0,3));
        const kesuben = desa.find(x => /kesuben/i.test(x.name));
        console.log(kesuben ? '🎉 Kesuben DITEMUKAN!' : '❌ Kesuben TIDAK ditemukan', kesuben);

        return {
          provinsi: p.length,
          kabupaten: k.length,
          kecamatan: kec.length,
          desa: desa.length,
          kesuben: !!kesuben
        };
      }catch(e){
        console.error('Test gagal:', e);
      }
    }
  };

  console.log('%c[wilayah-api] Patch aktif: EMSIFA → ihsaninh.github.io',
    'background:#006400;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold;');
})();
/* RoboPharma touch kiosk — offline cache.
 *
 * The kiosk is served over HTTPS from GitHub Pages. This worker copies the
 * whole presentation (~75 MB) into the kiosk browser's own storage, so after
 * one online visit it runs with no network at all, and picks up changes the
 * next time it is online.
 *
 *   - index.html / sw.js  -> NETWORK FIRST, falling back to cache.
 *     Online it always gets the latest build; offline it uses the stored copy.
 *
 *   - images / video / fonts -> CACHE FIRST.
 *     Big and effectively unchanging. To replace one, give it a new filename
 *     or bump CACHE below, or kiosks keep showing the old file.
 */
var CACHE = 'robopharma-kiosk-v3';   // v3: By Numbers photo (technician loading RoboWall)

var SHELL = ['./', './index.html'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); })
                      .catch(function(){})
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k === CACHE ? null : caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function isDocument(req){
  if (req.mode === 'navigate') return true;
  var u = new URL(req.url);
  return /\/$|index\.html$|\.js$/.test(u.pathname);
}

self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;   // leave Google Fonts to the browser

  if (isDocument(e.request)){
    e.respondWith(
      fetch(e.request).then(function(res){
        if (res && res.status === 200 && res.type === 'basic'){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){
        return caches.match(e.request, {ignoreSearch:true}).then(function(hit){
          return hit || caches.match('./index.html');
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, {ignoreSearch:true}).then(function(hit){
      if (hit) return hit;
      return fetch(e.request).then(function(res){
        if (res && res.status === 200 && res.type === 'basic'){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      });
    })
  );
});

/* The page sends its full asset list once it has booted. Fetch them one at a
   time so a weak connection isn't swamped by four videos at once. Progress
   goes back to the page for the ?cache readout. */
self.addEventListener('message', function(e){
  var msg = e.data || {};
  if (msg.type !== 'PRECACHE' || !msg.urls) return;

  e.waitUntil(caches.open(CACHE).then(function(c){
    var urls = msg.urls, i = 0, stored = 0;

    function report(done){
      self.clients.matchAll().then(function(cs){
        cs.forEach(function(cl){
          cl.postMessage({type:'PRECACHE_PROGRESS', done:stored, total:urls.length, finished:!!done});
        });
      });
    }

    function step(){
      if (i >= urls.length){ report(true); return Promise.resolve(); }
      var u = urls[i++];
      return c.match(u).then(function(hit){
        if (hit){ stored++; report(); return step(); }
        return fetch(u, {cache:'no-cache'})
          .then(function(res){ if (res && res.status === 200) return c.put(u, res.clone()); })
          .then(function(){ stored++; report(); return step(); })
          .catch(function(){ return step(); });   // one bad asset must not stop the run
      });
    }
    return step();
  }));
});

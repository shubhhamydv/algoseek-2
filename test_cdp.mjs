import http from 'http';

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(p => p.url.includes('3002') || p.title.includes('AlgoSeek'));
    const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);
    ws.addEventListener('open', () => {
      let id = 1;
      function send(method, params = {}) {
        ws.send(JSON.stringify({ id: id++, method, params }));
      }

      send('Runtime.enable');

      send('Runtime.evaluate', {
        expression: `(() => {
          // Scroll so search panel is at the exact position shown in user's screenshot (near top of viewport)
          const search = document.querySelector('.search-panel');
          if (!search) return { error: 'no search panel' };
          
          // Scroll search panel to top of window
          const searchTop = search.getBoundingClientRect().top + window.scrollY;
          window.scrollTo(0, searchTop - 40);

          const btn = document.querySelector('[data-mode="playlist"]');
          const rect = btn.getBoundingClientRect();
          const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);

          const showcase = document.querySelector('.rag-showcase-section');
          const sticky = document.querySelector('.rag-showcase-sticky');

          return {
            windowScrollY: window.scrollY,
            btnRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
            elAtPointTag: el?.tagName,
            elAtPointClass: el?.className,
            elAtPointId: el?.id,
            isEqual: el === btn || btn.contains(el),
            showcaseRect: showcase?.getBoundingClientRect(),
            stickyRect: sticky?.getBoundingClientRect(),
            searchRect: search?.getBoundingClientRect()
          };
        })()`,
        returnByValue: true
      });

      ws.addEventListener('message', (event) => {
        const parsed = JSON.parse(event.data);
        if (parsed.result?.result?.value) {
          console.log('OVERLAY RESULT:', JSON.stringify(parsed.result.result.value, null, 2));
          process.exit(0);
        }
      });
    });
  });
});

import http from 'http';

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(p => p.url.includes('3002') || p.title.includes('AlgoSeek'));
    if (!target) {
      console.error('Target not found', list);
      process.exit(1);
    }
    const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);
    ws.addEventListener('open', () => {
      let id = 1;
      function send(method, params = {}) {
        ws.send(JSON.stringify({ id: id++, method, params }));
      }
      send('Runtime.enable');
      send('Runtime.evaluate', {
        expression: `(() => {
          const search = document.querySelector(".search-panel");
          if (!search) return { error: "no search panel" };
          search.scrollIntoView({ behavior: "instant", block: "center" });

          const btn = document.querySelector('[data-mode="playlist"]');
          const input = document.querySelector(".search-input");
          const askBtn = document.querySelector(".search-button");
          const suggestions = document.querySelectorAll(".suggestion-pill");

          const btnRect = btn ? btn.getBoundingClientRect() : null;
          const inputRect = input ? input.getBoundingClientRect() : null;
          const askRect = askBtn ? askBtn.getBoundingClientRect() : null;

          const elBtn = btnRect ? document.elementFromPoint(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2) : null;
          const elInput = inputRect ? document.elementFromPoint(inputRect.left + 50, inputRect.top + inputRect.height / 2) : null;
          const elAsk = askRect ? document.elementFromPoint(askRect.left + askRect.width / 2, askRect.top + askRect.height / 2) : null;

          return {
            windowScrollY: window.scrollY,
            btnRect,
            inputRect,
            askRect,
            elBtnTag: elBtn?.tagName,
            elBtnClass: elBtn?.className,
            elBtnOuter: elBtn?.outerHTML?.slice(0, 150),
            elInputTag: elInput?.tagName,
            elInputClass: elInput?.className,
            elInputOuter: elInput?.outerHTML?.slice(0, 150),
            elAskTag: elAsk?.tagName,
            elAskClass: elAsk?.className,
            btnMatches: elBtn === btn || btn?.contains(elBtn),
            inputMatches: elInput === input || input?.contains(elInput),
            askMatches: elAsk === askBtn || askBtn?.contains(elAsk),
            suggestionsCount: suggestions.length
          };
        })()`,
        returnByValue: true
      });
      ws.addEventListener('message', (ev) => {
        const parsed = JSON.parse(ev.data);
        if (parsed.result?.result?.value) {
          console.log('HIT TEST RESULT:\n', JSON.stringify(parsed.result.result.value, null, 2));
          process.exit(0);
        }
      });
    });
  });
});

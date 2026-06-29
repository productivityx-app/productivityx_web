let endTime = 0;

self.onmessage = (e: MessageEvent<{ type: 'START'; endTime: number } | { type: 'STOP' }>) => {
  if (e.data.type === 'START') {
    endTime = e.data.endTime;
    const tick = () => {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      self.postMessage({ remaining, done: remaining === 0 });
      if (remaining > 0) setTimeout(tick, 200);
    };
    tick();
  }
};

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        // Das preloadResponse wurde hier entfernt, um den Fehler zu vermeiden
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.error("Fetch failed:", error);
        throw error;
      }
    })()
  );
});

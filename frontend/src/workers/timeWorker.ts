let intervalId: ReturnType<typeof setInterval> | null = null;

self.onmessage = (e) => {
  console.log("👷‍♂️ Worker escuchó la orden:", e.data);

  if (e.data === "start") {
    if (!intervalId) {
      intervalId = setInterval(() => {
        console.log("👷‍♂️ Worker enviando tick...");
        self.postMessage("tick");
      }, 1000);
    }
  } else if (e.data === "stop") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};

export {};

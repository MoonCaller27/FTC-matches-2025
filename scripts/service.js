import React, { useEffect } from 'https://esm.sh/react';

export function ChromeMessageListener() {
  useEffect(() => {
    function listener(data, sender, sendResponse) {
      const prom = fetch(data.url, {
        headers: {
          authorization: 'Basic ' + btoa('karsteny:3298DEAE-A59D-487C-8092-3C4B1C63ECE3')
        },
        cache: 'no-store'
      })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return JSON.parse("{\"error\": \"" + response.status + "\"}");
        }
      })
      .then((deeta) => sendResponse(deeta))
      .catch((reason) => {
        sendResponse(JSON.parse("{\"error\": \"Failed to fetch.\"}"));
      });
      
      return true; // keep channel open
    }

    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  }, []);

  return null;
}

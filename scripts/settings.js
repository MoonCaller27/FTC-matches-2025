import React, { useState, useEffect } from 'react';

export function OptionsForm() {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [refresh, setRefresh] = useState(30);
  const [status, setStatus] = useState('');
  function loadOptions() {
    chrome.storage.sync.get(
      { username: '', token: '', refresh: 30 },
      function(items) {
        setUsername(items.username);
        setToken(items.token);
        setRefresh(items.refresh);
      }
    );
  }
  useEffect(() => {
    loadOptions();
  }, []);
  function save() {
    chrome.storage.sync.set(
      {
        username: username,
        token: token,
        refresh: refresh
      },
      function() {
        setStatus('Saved!');
        setTimeout(function() {
          setStatus('');
        }, 1000);
      }
    );
  }

  return (
    <div>
      <div>
        <label htmlFor="username">Username:</label>
        <input
          id="username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="token">Token:</label>
        <input
          id="token"
          value={token}
          onChange={e => setToken(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="refresh">Refresh:</label>
        <input
          id="refresh"
          type="number"
          value={refresh}
          onChange={e => setRefresh(Number(e.target.value))}
        />
      </div>

      <button id="submit" onClick={save}>
        Save
      </button>

      <div id="status">{status}</div>
    </div>
  );
}

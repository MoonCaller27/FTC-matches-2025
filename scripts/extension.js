import React, { useState } from 'react';

export default function Extension() {
  const [team, setTeam] = useState('');
  const [code, setCode] = useState('');
  const [teamError, setTeamError] = useState('');
  const [codeError, setCodeError] = useState('');
  const regex = /^[0-9]+$/;

  const openSite = async () => {
    setTeamError('');
    setCodeError('');
    let bad = false;

    if (team.trim() === '') {
      bad = true;
      setTeamError('Team number is blank.');
    } else if (!regex.test(team.trim())) {
      bad = true;
      setTeamError('Team number is not a number.');
    }

    if (code.trim() === '') {
      bad = true;
      setCodeError('Event code is blank.');
    }

    if (!bad) {
      const eventResponse = await chrome.runtime.sendMessage({
        url: `https://ftc-api.firstinspires.org/v2.0/2024/events?eventCode=${code.trim()}`
      });
      const teamResponse = await chrome.runtime.sendMessage({
        url: `https://ftc-api.firstinspires.org/v2.0/2024/teams?teamNumber=${team.trim()}`
      });

      if (teamResponse.error) {
        bad = true;
        setTeamError(
          teamResponse.error === '400'
            ? 'Invalid team number'
            : `An unknown error occurred: ${teamResponse.error}`
        );
      }

      if (eventResponse.error) {
        bad = true;
        setCodeError(
          eventResponse.error === '404'
            ? 'Invalid event code'
            : `An unknown error occurred: ${eventResponse.error}`
        );
      }

      if (!bad) {
        const wind = window.open('/index.html', '', 'popup');
        wind.num = team.trim();
        wind.teamName = teamResponse.teams[0].nameShort;
        wind.evCode = code.trim();
        wind.evName = eventResponse.events[0].name;
      }
    }
  };

  return (
    <div className="w3-container">
      <h3>FTC Matches</h3>

      <label htmlFor="team">Team Number:</label><br />
      <input
        id="team"
        type="text"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      /><br />
      {teamError && (
        <span style={{ color: 'red' }} id="team-error">
          {teamError}
        </span>
      )}
      <br />

      <label htmlFor="code">Event Code:</label><br />
      <input
        id="code"
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      /><br />
      {codeError && (
        <span style={{ color: 'red' }} id="code-error">
          {codeError}
        </span>
      )}
      <br />

      <button
        id="submit"
        className="w3-button w3-blue"
        onClick={openSite}
      >
        Open
      </button>
    </div>
  );
}

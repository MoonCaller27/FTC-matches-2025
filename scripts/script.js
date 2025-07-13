import React, { useState, useEffect, useRef } from 'https://esm.sh/react';
import { trackedEvent } from './tracker';
import { createDivWithClassAndText } from './helpfulHTML';

export default function MatchDashboard() {
  const team = window.num;
  const evCode = window.evCode;
  const evName = window.evName;
  const teamName = window.teamName;
  const listRef = useRef(null);
  const scrollARef = useRef(null);
  const scrollBRef = useRef(null);
  const counterRef = useRef(null);
  const trackerRef = useRef(null);
  const lastValRef = useRef(-5);
  const [teamSchedule, setTeamSchedule] = useState(null);
  const [allSchedule, setAllSchedule] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [rankResponse, setRankResponse] = useState({ rankings: [] });
  const getData = async () => {
    const scheduleUrl = `https://ftc-api.firstinspires.org/v2.0/2024/schedule/${evCode}?teamNumber=${team}`;
    const qualUrl = `https://ftc-api.firstinspires.org/v2.0/2024/schedule/${evCode}?tournamentLevel=qual`;
    const playoffUrl = `https://ftc-api.firstinspires.org/v2.0/2024/schedule/${evCode}?tournamentLevel=playoff`;
    const resultsUrl = `https://ftc-api.firstinspires.org/v2.0/2024/matches/${evCode}`;
    const ranksUrl = `https://ftc-api.firstinspires.org/v2.0/2024/rankings/${evCode}`;

    const [ts, qual, playoff, results, ranks] = await Promise.all([
      chrome.runtime.sendMessage({ url: scheduleUrl }),
      chrome.runtime.sendMessage({ url: qualUrl }),
      chrome.runtime.sendMessage({ url: playoffUrl }),
      chrome.runtime.sendMessage({ url: resultsUrl }),
      chrome.runtime.sendMessage({ url: ranksUrl })
    ]);

    if (ts.error || qual.error || playoff.error || results.error || ranks.error) {
      document.getElementById('error-message').style.display = 'block';
      return false;
    }
    document.getElementById('error-message').style.display = 'none';

    setTeamSchedule(ts);
    setAllSchedule([...qual.schedule, ...playoff.schedule]);
    setAllResults(results);
    setRankResponse(ranks);
    return true;
  };
  const ranksToKeyPairs = () => {
    const map = {};
    rankResponse.rankings.forEach(({ teamNumber, rank }) => {
      map[teamNumber] = rank;
    });
    return map;
  };

  // init
  useEffect(() => {
    document.title = `${team} - ${evCode}`;
    document.getElementById('team-name').textContent = `${team} - ${teamName}`;
    document.getElementById('meet-details').textContent = evName;

    let interval;
    const initialize = async () => {
      if (!(await getData())) return;
      const rankPairs = ranksToKeyPairs();
      trackerRef.current = new trackedEvent(allSchedule, allResults, evCode, teamSchedule);
      trackerRef.current.addElements(scrollARef.current, scrollBRef.current);
      trackerRef.current.updateRanks(rankPairs);
      // spacer
      const spacer = document.createElement('div'); spacer.style.height = '2em';
      scrollARef.current.appendChild(spacer);
      statusUpdate();
      updateScroll();
      interval = setInterval(updateEverything, 20000);
    };
    initialize();
    window.addEventListener('resize', handleResize);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSchedule, allResults, rankResponse, teamSchedule]);
  const updateEverything = async () => {
    if (!(await getData())) return;
    const rankPairs = ranksToKeyPairs();
    if (trackerRef.current.isChanged(allSchedule)) {
      scrollARef.current.innerHTML = '';
      scrollBRef.current.innerHTML = '';
      trackerRef.current = new trackedEvent(allSchedule, allResults, evCode, teamSchedule);
      trackerRef.current.addElements(scrollARef.current, scrollBRef.current);
      trackerRef.current.updateRanks(rankPairs);
      const spacer = document.createElement('div'); spacer.style.height = '2em';
      scrollARef.current.appendChild(spacer);
      updateScroll();
      statusUpdate();
    } else {
      trackerRef.current.updateScoresAndStatus(allResults);
      trackerRef.current.updateRanks(rankPairs);
      statusUpdate();
    }
  };

  // scroll
  const updateScroll = () => {
    const a = scrollARef.current;
    const b = scrollBRef.current;
    const list = listRef.current;
    if (a.offsetHeight > list.offsetHeight) {
      a.getAnimations().forEach(anim => anim.cancel());
      b.getAnimations().forEach(anim => anim.cancel());
      a.animate({ top: ['0em', `-${a.offsetHeight}px`] }, { duration: a.offsetHeight * 27, easing: 'linear', iterations: Infinity });
      b.animate({ top: ['0em', `-${a.offsetHeight}px`] }, { duration: a.offsetHeight * 27, easing: 'linear', iterations: Infinity });
      b.style.display = 'block';
    } else {
      a.getAnimations().forEach(anim => anim.cancel());
      b.getAnimations().forEach(anim => anim.cancel());
      b.style.display = 'none';
    }
  };

  // debounce resizing
  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateScroll, 1000);
  };
  const statusUpdate = () => {
    const next = trackerRef.current.getNextNum();
    const container = counterRef.current;
    let content;
    if (next[0] === -1) {
      content = createDivWithClassAndText('counter-content', 'No more matches scheduled for this team.');
      container.style.borderBottomColor = '#707070';
    } else if (next[0] === 0) {
      content = createDivWithClassAndText('counter-content', getDisplayText(next));
      container.style.borderBottomColor = '#0a72ce';
    } else if (next[0] === 1) {
      content = createDivWithClassAndText('counter-content', getDisplayText(next));
      container.style.borderBottomColor = '#ff9800';
    } else if (next[0] > 1) {
      content = createDivWithClassAndText('counter-content', getDisplayText(next));
      container.style.borderBottomColor = '#26c22d';
    } else if (next[0] === -2) {
      content = createDivWithClassAndText('counter-content', 'No matches scheduled for this team or event not started.');
      container.style.borderBottomColor = '#707070';
    }
    // animate swap
    const anim = container.children[0].animate({ bottom: ['0%', '110%'] }, { duration: 700, easing: 'ease-out', fill: 'forwards' });
    anim.finished.then(() => {
      container.replaceChildren(content);
      container.children[0].animate({ bottom: ['-110%', '0%'] }, { duration: 700, easing: 'ease-out', fill: 'forwards' });
    });
    lastValRef.current = next[0];
  };
  const getDisplayText = ([state, match, rounds, nextMatch]) => {
    let text = '';
    if (state === 0) {
      text = `${match.tournamentLevel[0]}${match.series || ''}M${match.matchNumber}: In progress`;
      if (rounds !== -1) text += ` Next: ${nextMatch.tournamentLevel[0]}${nextMatch.series || ''}M${nextMatch.matchNumber}: Queue in ${rounds - 1} rounds.`;
    } else if (state === 1) {
      text = `${match.tournamentLevel[0]}${match.series || ''}M${match.matchNumber}: Queue NOW` + (match.field ? ` - Field ${match.field}` : '');
      text += match.getTeamAlliance() === 'red' ? ' RED' : ' BLUE';
    } else if (state > 1) {
      text = `${match.tournamentLevel[0]}${match.series || ''}M${match.matchNumber}: Queue in ${state - 1} rounds`;
      if (match.field) text += ` - Field ${match.field}`;
      text += match.getTeamAlliance() === 'red' ? ' RED' : ' BLUE';
    }
    return text;
  };

  return (
    <>
      <div id="counter-container" ref={counterRef}>
        <div className="counter-content" />
      </div>
      <div id="match_list" ref={listRef} />
      <div id="scroll-wrapper">
        <div id="scroll-container-a" ref={scrollARef} />
        <div id="scroll-container-b" ref={scrollBRef} />
      </div>
      <div id="error-message" style={{ display: 'none' }}>Error fetching data.</div>
    </>
  );
}

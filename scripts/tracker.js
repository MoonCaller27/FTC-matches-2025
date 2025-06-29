import { useState, useEffect, useRef } from 'react';
import { twoTeamMatch } from './match';
import { threeTeamMatch } from './3match';
export function useTrackedEvent(matchSchedule, matchResultData, team, teamSchedule) {
  const [fields, setFields] = useState([]);
  const [fieldNumbers, setFieldNumbers] = useState([]);
  const [teamMatches, setTeamMatches] = useState([]);
  const trackerRef = useRef({});

  // Build fields and fieldNumbers
  useEffect(() => {
    const numbers = [];
    const built = [];

    class trackedField {
      constructor(fieldNumber, schedule, resultData) {
        this.fieldNumber = fieldNumber;
        this.currentMatch = 0;
        this.lastMatch = -1;
        this.matches = [];
        // build
        schedule.forEach(el => {
          if (el.field === fieldNumber) {
            const orderedTeams = [];
            el.teams.forEach(obj => {
              const map = { Red1:0, Red2:1, Red3:2, Blue1:3, Blue2:4, Blue3:5 };
              orderedTeams[map[obj.station]] = obj;
            });
            if (orderedTeams.length > 5) {
              this.matches.push(new threeTeamMatch(
                el.description, el.series, el.matchNumber,
                el.tournamentLevel, 'Upcoming', fieldNumber,
                orderedTeams[0],orderedTeams[1],orderedTeams[2],null,
                orderedTeams[3],orderedTeams[4],orderedTeams[5],null
              ));
            } else {
              this.matches.push(new twoTeamMatch(
                el.description, el.series, el.matchNumber,
                el.tournamentLevel, 'Upcoming', fieldNumber,
                orderedTeams[0],orderedTeams[1],null,
                orderedTeams[3],orderedTeams[4],null
              ));
            }
          }
        });
        this.updateMatchNumber(resultData);
      }
      updateMatchNumber(resultData) {
        this.currentMatch = 0;
        this.lastMatch = -1;
        let ind = 0;
        resultData.matches.forEach(res => {
          if (this.matches[ind] && res.description === this.matches[ind].description) {
            this.matches[ind].setStatus('Completed');
            this.matches[ind].setScore(res.scoreRedFinal, res.scoreBlueFinal);
            this.lastMatch = ind;
            this.currentMatch = ind < this.matches.length - 1 ? ind + 1 : -1;
            ind++;
          }
        });
        if (this.matches[ind]) this.matches[ind].setStatus('In Progress');
      }
      compareMatch(match) {
        return this.matches.indexOf(match) - this.currentMatch;
      }
      getMatch(matchDesc) {
        return this.matches.find(m => m.description === matchDesc);
      }
    }

    matchSchedule.forEach(el => {
      if (!numbers.includes(el.field)) {
        built.push(new trackedField(el.field, matchSchedule, matchResultData));
        numbers.push(el.field);
      }
    });

    setFields(built);
    setFieldNumbers(numbers);
    trackerRef.current = { fields: built, fieldNumbers: numbers };
  }, [matchSchedule, matchResultData]);

  // Build teamMatches
  useEffect(() => {
    if (fields.length && teamSchedule) {
      const tm = [];
      fields.forEach(fieldObj => {
        teamSchedule.schedule.forEach(sch => {
          if (sch.field === fieldObj.fieldNumber) {
            const m = fieldObj.getMatch(sch.description);
            m.setTeam(team);
            m.createElements();
            tm.push(m);
          }
        });
      });
      setTeamMatches(tm);
    }
  }, [fields, teamSchedule, team]);

  // updateScoresAndStatus
  function updateScoresAndStatus(resultData) {
    fields.forEach(f => f.updateMatchNumber(resultData));
  }

  // addElements
  function addElements(scrollA, scrollB) {
    teamMatches.forEach(m => {
      scrollA.appendChild(m.getElementA());
      scrollB.appendChild(m.getElementB());
    });
  }

  // updateRanks
  function updateRanks(ranks) {
    teamMatches.forEach(m => m.updateRankings(ranks));
  }

  // isChanged
  function isChanged(allSchedule) {
    const total = fields.reduce((sum, f) => sum + f.matches.length, 0);
    return total !== allSchedule.length;
  }

  // getNextNum
  function getNextNum() {
    if (!teamMatches.length) return [-2];
    for (let i = 0; i < teamMatches.length; i++) {
      const match = teamMatches[i];
      if (match.status === 'In Progress') {
        const next = teamMatches[i+1] || null;
        const dist = next ? fields[fieldNumbers.indexOf(next.field)]?.compareMatch(next) : -1;
        return [0, match, dist, next];
      }
      if (match.status === 'Upcoming') {
        const dist = fields[fieldNumbers.indexOf(match.field)]?.compareMatch(match);
        return [dist, match];
      }
    }
    return [-1];
  }

  return {
    fields,
    fieldNumbers,
    teamMatches,
    teamNumber: team,
    updateScoresAndStatus,
    addElements,
    updateRanks,
    isChanged,
    getNextNum
  };
}

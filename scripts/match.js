import React, { useState, useEffect } from 'https://esm.sh/react';
import { createDivWithClassAndText, gimmeADivider, createTeamDiv } from './helpfulHTML';

export function TwoTeamMatch({
  description,
  series,
  matchNumber,
  tournamentLevel,
  initialStatus,
  field,
  redTeamA,
  redTeamB,
  blueTeamA,
  blueTeamB,
  initialRedScore = null,
  initialBlueScore = null,
  initialTeamNumber,
  rankList = {}
}) {
  // local state
  const [redScore, setRedScore] = useState(initialRedScore);
  const [blueScore, setBlueScore] = useState(initialBlueScore);
  const [status, setStatus] = useState(initialStatus);
  const [teamNumber, setTeamNumber] = useState(initialTeamNumber);
  const [rankings, setRankings] = useState(rankList);

  // determine score classes
  const redScoreClass = () => {
    const base = 'light-ftc-red score';
    return redScore != null && blueScore != null && redScore > blueScore
      ? `${base} bold`
      : base;
  };
  const blueScoreClass = () => {
    const base = 'light-ftc-blue score';
    return redScore != null && blueScore != null && blueScore > redScore
      ? `${base} bold`
      : base;
  };

  // render header portion
  const renderHeader = () => (
    <div className="match-header">
      {createDivWithClassAndText({ classN: 'info', text: description })}
      {gimmeADivider()}
      {redScore == null ? (
        <>
          {createDivWithClassAndText({ classN: 'very-light-gray score', text: '' })}
          {gimmeADivider()}
          {createDivWithClassAndText({ classN: 'very-light-gray score', text: '' })}
        </>
      ) : (
        <>
          {createDivWithClassAndText({ classN: redScoreClass(), text: redScore })}
          {gimmeADivider()}
          {createDivWithClassAndText({ classN: blueScoreClass(), text: blueScore })}
        </>
      )}
      {gimmeADivider()}
      {createDivWithClassAndText({ classN: 'info', text: status })}
    </div>
  );

  // helper to get display name with ranking
  const displayName = (team) => {
    const rank = rankings[team.teamNumber];
    return rank != null ? `#${rank} | ${team.teamName}` : team.teamName;
  };

  // render match stats (team rows)
  const renderMatchStat = () => (
    <div className="match-stat">
      {createTeamDiv({ colorClass: 'dark-ftc-red', teamNumber: redTeamA.teamNumber, teamName: displayName(redTeamA), isBold: redTeamA.teamNumber === teamNumber })}
      {gimmeADivider()}
      {createTeamDiv({ colorClass: 'dark-ftc-red', teamNumber: redTeamB.teamNumber, teamName: displayName(redTeamB), isBold: redTeamB.teamNumber === teamNumber })}
      {gimmeADivider()}
      {createTeamDiv({ colorClass: 'dark-ftc-blue', teamNumber: blueTeamA.teamNumber, teamName: displayName(blueTeamA), isBold: blueTeamA.teamNumber === teamNumber })}
      {gimmeADivider()}
      {createTeamDiv({ colorClass: 'dark-ftc-blue', teamNumber: blueTeamB.teamNumber, teamName: displayName(blueTeamB), isBold: blueTeamB.teamNumber === teamNumber })}
    </div>
  );

  return (
    <div className="two-team-match">
      {renderHeader()}
      {renderMatchStat()}
    </div>
  );
}

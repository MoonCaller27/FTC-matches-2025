import React from 'https://esm.sh/react';
import { createDivWithClassAndText, gimmeADivider, createTeamDiv } from '../helpers';

export default function ThreeTeamMatch({
  description,
  series,
  matchNumber,
  tournamentLevel,
  status,
  field,
  redTeams,
  blueTeams,
  redScore,
  blueScore,
  teamNumber,
  rankList = {}
}) {
  const getScoreClasses = () => {
    const redClass = redScore > blueScore ? 'light-ftc-red score bold' : 'light-ftc-red score';
    const blueClass = blueScore > redScore ? 'light-ftc-blue score bold' : 'light-ftc-blue score';
    return { redClass, blueClass };
  };

  const renderHeader = () => {
    const { redClass, blueClass } = getScoreClasses();
    return (
      <div className="match-header">
        {createDivWithClassAndText('info', description)}
        {gimmeADivider()}
        {redScore == null ? (
          <>
            {createDivWithClassAndText('very-light-gray score', '')}
            {gimmeADivider()}
            {createDivWithClassAndText('very-light-gray score', '')}
          </>
        ) : (
          <>
            {createDivWithClassAndText(redClass, redScore)}
            {gimmeADivider()}
            {createDivWithClassAndText(blueClass, blueScore)}
          </>
        )}
        {gimmeADivider()}
        {createDivWithClassAndText('info', status)}
      </div>
    );
  };

  const renderTeams = (teams, color) =>
    teams.map((team, idx) => {
      const key = `${color}-${team.teamNumber}-${idx}`;
      const isActive = team.teamNumber === teamNumber;
      const classes = `dark-ftc-${color}`;
      const displayName = rankList[team.teamNumber]
        ? `#${rankList[team.teamNumber]} | ${team.teamName}`
        : team.teamName;
      return (
        <React.Fragment key={key}>
          {createTeamDiv(classes, team.teamNumber, displayName, isActive)}
          {idx < teams.length - 1 && gimmeADivider()}
        </React.Fragment>
      );
    });

  return (
    <div className="three-team-match">
      {renderHeader()}
      <div className="match-stat">
        {renderTeams(redTeams, 'red')}
        {gimmeADivider()}
        {renderTeams(blueTeams, 'blue')}
      </div>
    </div>
  );
}

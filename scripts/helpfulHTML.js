import React from 'https://esm.sh/react';
export function createDivWithClassAndText({ classN, text }) {
  return <div className={classN}>{text}</div>;
}
export function createTeamDiv({ colorClass, teamNumber, teamName, isBold = false }) {
  return (
    <div className={`${colorClass} team`}>
      <span className={isBold ? 'bold' : undefined}>
        {teamNumber}
      </span>
      {createDivWithClassAndText({ classN: 'team-name', text: teamName })}
    </div>
  );
}
export function gimmeADivider() {
  return <div className="divider" />;
}

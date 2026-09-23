import { foundingProgress } from "../lib/founding50";

export default function Founding50Progress({ confirmedCount, unavailable = false }) {
  const progress = unavailable ? null : foundingProgress(confirmedCount);
  return (
    <section className="founding-progress" aria-label="Founding 50 progress" aria-live="polite">
      <p className="founding-progress-title">THE FOUNDING 50</p>
      {!progress ? <p className="founding-progress-detail">{unavailable ? "Progress temporarily unavailable" : "Loading confirmed places…"}</p> : progress.complete ? (
        <p className="founding-progress-detail"><strong>COMPLETE</strong><span>Numbers #000001–#000050 keep their mark.</span></p>
      ) : (
        <>
          <p className="founding-progress-detail"><strong>{progress.claimed} / 50 claimed</strong><span>{progress.remaining} {progress.remaining === 1 ? "place" : "places"} remaining</span></p>
          <progress value={progress.claimed} max="50" aria-label={`${progress.claimed} of 50 confirmed supporters`} />
        </>
      )}
    </section>
  );
}

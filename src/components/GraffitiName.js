import { paintHex, resolvePaint } from "../lib/graffiti";
import "./graffiti.css";
import Founding50Badge from "./Founding50Badge";
import { isFounding50 } from "../lib/founding50";

export default function GraffitiName({ name, number, paintStyle, paintColour, numberLabel, status, heading = false, confirmed = false }) {
  const paint = resolvePaint(paintStyle, paintColour, number);
  const text = typeof name === "string" && name.trim() ? name.trim() : "Your Name";
  const longestWord = Math.max(1, ...text.split(/\s+/).map((word) => Array.from(word).length));
  const size = `${Math.min(27, 85 / longestWord)}cqi`;
  const Tag = heading ? "h2" : "p";
  return (
    <div className="paint-place" style={{ "--paint-colour": paintHex(paint.colour), "--paint-size": size }}>
      <div className={confirmed && isFounding50(number) ? "paint-artwork paint-artwork-founder" : "paint-artwork"}>
        <div className="paint-area">
          <Tag className={`paint-name paint-${paint.style}`} dir="auto">{text}</Tag>
        </div>
        {confirmed && isFounding50(number) && <Founding50Badge />}
      </div>
      <p className="paint-number">
        {numberLabel ?? (number ? `#${String(number).padStart(6, "0")}` : "#------")}
      </p>
      {status && <p className="paint-status">{status}</p>}
    </div>
  );
}

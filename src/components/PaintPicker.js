import { PAINT_STYLES, PAINT_COLOURS, paintHex } from "../lib/graffiti";
import "./graffiti.css";

export default function PaintPicker({ paintStyle, paintColour, onStyleChange, onColourChange, disabled }) {
  return (
    <div className="paint-picker">
      <fieldset disabled={disabled}>
        <legend>Choose your lettering</legend>
        <div className="paint-style-options">
          {PAINT_STYLES.map((style) => (
            <label className="paint-style-option" key={style.id}>
              <input type="radio" name="paintStyle" value={style.id} checked={paintStyle === style.id} onChange={() => onStyleChange(style.id)} />
              <span className="paint-option-face">
                <span className={`paint-sample paint-${style.id}`} style={{ color: paintHex(paintColour) }} aria-hidden="true">Your name</span>
                <span className="paint-option-label">{style.label}<span aria-hidden="true">{paintStyle === style.id ? " ✓" : ""}</span></span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={disabled} className="paint-colour-field">
        <legend>Choose your paint colour</legend>
        <div className="paint-colour-options">
          {PAINT_COLOURS.map((colour) => (
            <label className="paint-colour-option" key={colour.id}>
              <input type="radio" name="paintColour" value={colour.id} checked={paintColour === colour.id} onChange={() => onColourChange(colour.id)} />
              <span className="paint-swatch" style={{ backgroundColor: colour.hex }} aria-hidden="true">{paintColour === colour.id ? "✓" : ""}</span>
              <span>{colour.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="paint-picker-note">Every style and colour is included. Everyone gets the same space.</p>
    </div>
  );
}

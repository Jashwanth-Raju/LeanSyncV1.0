/** @jsxImportSource react */
import * as React from "react";
import type { EmissionFactorDefaults } from "../types";

export type EmissionWizardStage = "prompt" | "form";

export type EmissionWizardProps = {
  open: boolean;
  stage: EmissionWizardStage;
  defaults: EmissionFactorDefaults;
  onAcceptTracking: () => void;
  onSkip: () => void;
  onSubmit: (values: EmissionFactorDefaults) => void;
  onClose: () => void;
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(12px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 40,
};

const cardStyle: React.CSSProperties = {
  width: "min(520px, 92vw)",
  borderRadius: 28,
  padding: "28px 32px",
  background: "linear-gradient(165deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92))",
  border: "1px solid rgba(148, 163, 184, 0.32)",
  boxShadow: "0 34px 68px rgba(15, 23, 42, 0.45)",
  color: "#e2e8f0",
  display: "flex",
  flexDirection: "column",
  gap: 26,
};

const buttonBase: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "rgba(15, 23, 42, 0.5)",
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: 13,
  letterSpacing: 0.6,
  textTransform: "uppercase",
  transition: "all 0.2s ease",
};

export const EmissionWizard: React.FC<EmissionWizardProps> = ({
  open,
  stage,
  defaults,
  onAcceptTracking,
  onSkip,
  onSubmit,
  onClose,
}) => {
  const [formValues, setFormValues] = React.useState<EmissionFactorDefaults>(defaults);

  React.useEffect(() => {
    if (open && stage === "form") {
      setFormValues(defaults);
    }
  }, [open, stage, defaults]);

  if (!open) return null;

  if (stage === "prompt") {
    return (
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#94a3b8" }}>
                Sustainability Setup
              </div>
              <h2 style={{ margin: "8px 0 0", fontSize: 24 }}>Track CO₂ emissions for this canvas?</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonBase, width: 38, height: 38, borderRadius: "50%" }}
            >
              ×
            </button>
          </header>
          <p style={{ margin: 0, fontSize: 14, color: "#cbd5f5" }}>
            We can auto-populate electricity, material, and transport emission factors for every node. You can
            fine-tune them later in the inspector.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onSkip}
              style={{ ...buttonBase, background: "rgba(148, 163, 184, 0.12)" }}
            >
              No thanks
            </button>
            <button
              type="button"
              onClick={onAcceptTracking}
              style={{
                ...buttonBase,
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4))",
                border: "1px solid rgba(59, 130, 246, 0.55)",
                boxShadow: "0 14px 28px rgba(34, 197, 94, 0.25)",
              }}
            >
              Yes, configure defaults
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={cardStyle}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#94a3b8" }}>
              Emission Factors
            </div>
            <h2 style={{ margin: "8px 0 0", fontSize: 24 }}>Set your baseline factors</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ ...buttonBase, width: 38, height: 38, borderRadius: "50%" }}
          >
            ×
          </button>
        </header>
        <p style={{ margin: 0, fontSize: 14, color: "#cbd5f5" }}>
          These values will pre-fill emission fields on every step. Adjust units or numbers as needed once the
          map is populated.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(formValues);
          }}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#bfdbfe" }}>
              Electricity factor (kg CO₂e / kWh)
            </span>
            <input
              type="text"
              value={formValues.electricity}
              onChange={(event) => setFormValues((prev) => ({ ...prev, electricity: event.target.value }))}
              placeholder="e.g. 0.4"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(96, 165, 250, 0.45)",
                background: "rgba(15, 23, 42, 0.55)",
                color: "#e2e8f0",
                padding: "10px 12px",
              }}
              required
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#fbcfe8" }}>
              Material factor (kg CO₂e / kg)
            </span>
            <input
              type="text"
              value={formValues.materials}
              onChange={(event) => setFormValues((prev) => ({ ...prev, materials: event.target.value }))}
              placeholder="e.g. 1.8"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(244, 114, 182, 0.4)",
                background: "rgba(15, 23, 42, 0.55)",
                color: "#e2e8f0",
                padding: "10px 12px",
              }}
              required
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#fde68a" }}>
              Transport factor (kg CO₂e / tonne-km)
            </span>
            <input
              type="text"
              value={formValues.transport}
              onChange={(event) => setFormValues((prev) => ({ ...prev, transport: event.target.value }))}
              placeholder="e.g. 0.09"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(250, 204, 21, 0.4)",
                background: "rgba(15, 23, 42, 0.55)",
                color: "#e2e8f0",
                padding: "10px 12px",
              }}
              required
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonBase, background: "rgba(148, 163, 184, 0.12)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...buttonBase,
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4))",
                border: "1px solid rgba(59, 130, 246, 0.55)",
                boxShadow: "0 14px 28px rgba(34, 197, 94, 0.25)",
              }}
            >
              Save & Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

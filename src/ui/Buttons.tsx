import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  palette?: {
    activeBg: string;
    borderColor: string;
    iconColor: string;
    shadow: string;
    disabledBg: string;
    disabledColor: string;
  };
}

const defaultPalette = {
  activeBg: "rgba(30, 41, 59, 0.9)",
  borderColor: "rgba(148, 163, 184, 0.4)",
  iconColor: "#f8fafc",
  shadow: "0 10px 18px rgba(15, 23, 42, 0.3)",
  disabledBg: "rgba(148, 163, 184, 0.25)",
  disabledColor: "#94a3b8",
};

export const IconButton = ({
  palette = defaultPalette,
  disabled,
  children,
  style,
  ...rest
}: PropsWithChildren<IconButtonProps>) => {
  return (
    <button
      {...rest}
      disabled={disabled}
      style={{
        width: 44,
        height: 44,
        borderRadius: 18,
        border: "1px solid",
        borderColor: disabled ? "rgba(148, 163, 184, 0.25)" : palette.borderColor,
        background: disabled ? palette.disabledBg : palette.activeBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : palette.shadow,
        color: disabled ? palette.disabledColor : palette.iconColor,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        opacity: disabled ? 0.65 : 1,
        backdropFilter: "blur(12px)",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

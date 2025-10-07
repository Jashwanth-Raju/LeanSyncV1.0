/** @jsxImportSource react */
import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ConnectionLineType,
  Handle,
  Position,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import type { Node, Edge, Connection } from "reactflow";
import "reactflow/dist/style.css";

import {
  FaTruck,
  FaCogs,
  FaWarehouse,
  FaUserTie,
  FaBoxOpen,
  FaUndo,
  FaRedo,
  FaSave,
  FaFolderOpen,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { auth, loginWithGoogle, logout, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Whiteboard from "./Whiteboard";

/* ------------ Types ------------ */
type MyNodeData = {
  label: string;
  icon: string;
  color: string;
  processTime?: string;
  cycleTime?: string;
  quantity?: number;
  owner?: string;
};

/* ------------ Node Library ------------ */
const nodeLibrary = [
  {
    category: "Transport",
    nodes: [
      { type: "truck", label: "Truck", icon: "truck", color: "#FFA500" },
      { type: "van", label: "Van", icon: "truck", color: "#FFB347" },
    ],
  },
  {
    category: "Process",
    nodes: [
      { type: "manufacturing", label: "Manufacturing", icon: "manufacturing", color: "#3498DB" },
      { type: "inspection", label: "Inspection", icon: "inspection", color: "#1ABC9C" },
    ],
  },
  {
    category: "Storage",
    nodes: [
      { type: "warehouse", label: "Warehouse", icon: "warehouse", color: "#2ECC71" },
      { type: "inventory", label: "Inventory", icon: "inventory", color: "#27AE60" },
    ],
  },
];

/* ------------ Icons ------------ */
const iconMap: Record<string, JSX.Element> = {
  truck: <FaTruck />,
  manufacturing: <FaCogs />,
  inspection: <FaUserTie />,
  warehouse: <FaWarehouse />,
  inventory: <FaBoxOpen />,
};

/* ------------ Custom Node ------------ */
const CustomNode = ({ data }: { data: MyNodeData }) => (
  <div
    style={{
      pointerEvents: "all",
      padding: 12,
      display: "flex",
      alignItems: "center",
      background: `linear-gradient(135deg, ${data.color}88, ${data.color})`,
      borderRadius: 12,
      color: "#fff",
      minWidth: 140,
      justifyContent: "flex-start",
      fontWeight: 600,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      cursor: "pointer",
    }}
  >
    <Handle type="target" position={Position.Top} style={{ background: "#555" }} />
    <div style={{ width: 28, marginRight: 10 }}>{iconMap[data.icon]}</div>
    <div>{data.label}</div>
    <Handle type="source" position={Position.Bottom} style={{ background: "#555" }} />
  </div>
);

const nodeTypes = { custom: CustomNode };

/* ------------ Header ------------ */
const Header = ({ user }: { user: User | null }) => {
  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase();

  return (
    <header
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        background: "linear-gradient(115deg, rgba(15, 23, 42, 0.92), rgba(59, 130, 246, 0.35))",
        borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(18px)",
        color: "#e2e8f0",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(14, 165, 233, 0.9))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 14px 30px rgba(37, 99, 235, 0.35)",
          }}
        >
          <img
            src="/mylogo.png"
            alt="Company logo"
            style={{ width: 26, height: 26, objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(15, 23, 42, 0.35))" }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.4 }}>LeanSync Value Stream</span>
          <span style={{ fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: "#94a3b8" }}>
            Operational Intelligence Suite
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {user && (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{user.displayName ?? user.email ?? "Signed in"}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>Connected</span>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(15, 23, 42, 0.8)",
                color: "#cbd5f5",
                border: "1px solid rgba(148, 163, 184, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 600,
                boxShadow: "0 10px 24px rgba(15, 23, 42, 0.35)",
              }}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? user.email ?? "User avatar"}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                userInitial ?? "?"
              )}
            </div>
            <button
              onClick={logout}
              style={{
                padding: "10px 16px",
                borderRadius: 14,
                border: "1px solid rgba(248, 113, 113, 0.5)",
                background: "linear-gradient(135deg, rgba(248, 113, 113, 0.9), rgba(239, 68, 68, 0.85))",
                color: "#fff5f5",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.3,
                cursor: "pointer",
                boxShadow: "0 12px 28px rgba(239, 68, 68, 0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

/* ------------ Icon Button ------------ */
const iconBtnStyle = (bg: string) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: bg,
  color: "#fff",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 14,
});

/* ------------ Main App ------------ */
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser));
    return () => unsub();
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header user={user} />
      {!user ? (
        <div style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <button
            onClick={loginWithGoogle}
            style={{
              padding: 12,
              fontSize: 16,
              background: "#4285F4",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div style={{ flexGrow: 1, background: "#fafafa", display: "flex" }}>
  <Whiteboard />
</div>
      )}
    </div>
  );
};

export default App;

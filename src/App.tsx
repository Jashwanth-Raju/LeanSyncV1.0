/** @jsxImportSource react */
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth, loginWithGoogle, logout } from "./firebase";
import { ProjectProvider, useProject } from "./lib/ProjectContext";
import { CollaborationProvider } from "./lib/CollaborationContext";
import { ProjectList } from "./ui/ProjectList";
import Whiteboard from "./Whiteboard";

const Header = ({ user }: { user: User | null }) => {
  const { selectedProjectId, selectedProfile, clearProject } = useProject();
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
          <img src="/mylogo.png" alt="LeanSync" style={{ width: 26, height: 26, objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.4 }}>LeanSync Value Stream</span>
          <span style={{ fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: "#94a3b8" }}>
            Operational Intelligence Suite
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {selectedProjectId && (
          <button
            type="button"
            onClick={clearProject}
            style={{
              borderRadius: 999,
              padding: "8px 14px",
              border: "1px solid rgba(255,255,255,0.3)",
              background: "rgba(255,255,255,0.08)",
              color: "#f8fafc",
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Switch Project
          </button>
        )}
        {selectedProjectId && (
          <span style={{ fontSize: 12, color: "#cbd5f5" }}>Profile · {selectedProfile}</span>
        )}
        {user ? (
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
                <img src={user.photoURL} alt="Avatar" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
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
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={loginWithGoogle}
            style={{
              padding: "10px 16px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(14, 165, 233, 0.9))",
              color: "#fff",
              fontWeight: 600,
              letterSpacing: 0.3,
              cursor: "pointer",
            }}
          >
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
};

const AppShell = ({ user }: { user: User | null }) => {
  const { selectedProjectId } = useProject();
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header user={user} />
      <div style={{ flexGrow: 1, background: "#0f172a", color: "#f8fafc", display: "flex" }}>
        {!user ? (
          <div style={{ margin: "auto", textAlign: "center" }}>
            <p style={{ marginBottom: 16 }}>Sign in to access your LeanSync workspaces.</p>
            <button
              onClick={loginWithGoogle}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(14, 165, 233, 0.95))",
                color: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign in with Google
            </button>
          </div>
        ) : selectedProjectId ? (
          <CollaborationProvider>
            <Whiteboard />
          </CollaborationProvider>
        ) : (
          <ProjectList />
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser));
    return () => unsub();
  }, []);

  return (
    <ProjectProvider userId={user?.uid ?? null}>
      <AppShell user={user} />
    </ProjectProvider>
  );
};

export default App;

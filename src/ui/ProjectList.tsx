import { useCallback, useEffect, useMemo, useState } from "react";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useProject } from "../lib/ProjectContext";
import { getProfileMeta } from "../profiles/meta";
import { CreateProjectModal } from "./CreateProjectModal";

const ensurePath = (path: string) => {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== path) {
    window.history.replaceState({}, "", path);
  }
};

export const ProjectList = () => {
  const {
    selectProject,
    projects,
    projectsLoading,
    projectsError,
    createProject,
    renameProject,
    selectedProjectId,
    deleteProject,
    duplicateProject,
    acceptInvite,
    userId,
  } = useProject();

  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "editor" | "viewer">("editor");
  const [isCreating, setIsCreating] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<Array<{ projectId: string; inviteId: string; name: string; role: string }>>([]);

  useEffect(() => {
    ensurePath("/projects");
  }, []);

  const navigateToWhiteboard = useCallback(() => {
    if (typeof window !== "undefined" && window.location.pathname !== "/whiteboard") {
      window.history.pushState({}, "", "/whiteboard");
    }
  }, []);

  const handleSelect = useCallback(
    (projectId: string) => {
      selectProject(projectId);
      navigateToWhiteboard();
    },
    [navigateToWhiteboard, selectProject]
  );

  const startRename = useCallback((projectId: string, currentName: string) => {
    setRenameTarget(projectId);
    setRenameValue(currentName);
  }, []);

  const cancelRename = useCallback(() => {
    setRenameTarget(null);
    setRenameValue("");
  }, []);

  const commitRename = useCallback(async () => {
    if (!renameTarget) return;
    const nextName = renameValue.trim();
    if (!nextName) return;
    try {
      await renameProject(renameTarget, nextName);
      cancelRename();
    } catch (error) {
      console.error("Failed to rename project", error);
    }
  }, [cancelRename, renameProject, renameTarget, renameValue]);

  const handleDelete = useCallback(
    async (projectId: string) => {
      const confirmed = window.confirm("Delete this project? This cannot be undone.");
      if (!confirmed) return;
      try {
        setDeletingId(projectId);
        await deleteProject(projectId);
      } catch (error) {
        console.error("Failed to delete project", error);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteProject]
  );

  const requestCreate = useCallback(() => setIsModalOpen(true), []);

  const handleCreate = useCallback(
    async (name: string, profile: string) => {
      try {
        setIsCreating(true);
        await createProject(name, profile);
        setIsModalOpen(false);
        navigateToWhiteboard();
      } catch (error) {
        console.error("Failed to create project", error);
      } finally {
        setIsCreating(false);
      }
    },
    [createProject, navigateToWhiteboard]
  );

  const handleDuplicate = useCallback(
    async (projectId: string) => {
      try {
        await duplicateProject(projectId);
        navigateToWhiteboard();
      } catch (error) {
        console.error("Failed to duplicate project", error);
      }
    },
    [duplicateProject, navigateToWhiteboard]
  );

  const handleOpenInvite = useCallback((projectId: string) => {
    setInviteProjectId(projectId);
    setInviteEmail("");
    setInviteRole("editor");
  }, []);

  const sendProjectInvite = useCallback(
    async (projectId: string, email: string, role: "owner" | "editor" | "viewer") => {
      if (!userId) return;
      const projectRef = doc(db, "users", userId, "projects", projectId);
      const invitesRef = collection(projectRef, "invites");
      const inviteDoc = doc(invitesRef);
      await setDoc(inviteDoc, {
        email,
        role,
        status: "pending",
        createdAt: serverTimestamp(),
      });
    },
    [userId]
  );

  const projectCards = useMemo(() => {
    if (projectsLoading) {
      return <span style={{ color: "#cbd5f5" }}>Loading your projects…</span>;
    }
    if (projectsError) {
      return <span style={{ color: "#fca5a5" }}>{projectsError}</span>;
    }
    if (projects.length === 0) {
      return <span style={{ color: "#cbd5f5" }}>No projects yet — create one to get started.</span>;
    }

    return projects.map((project) => {
      const isActive = selectedProjectId === project.id;
      const meta = getProfileMeta(project.industryProfile ?? "manufacturing");
      const lastUpdated =
        project.updatedAt && typeof project.updatedAt === "object" && "seconds" in project.updatedAt
          ? new Date((project.updatedAt as any).seconds * 1000).toLocaleString()
          : "Unknown";
      const metrics = project.metadata?.metrics;
      const isEditing = renameTarget === project.id;

      return (
        <div
          key={project.id}
          style={{
            minWidth: 280,
            maxWidth: 360,
            width: "100%",
            borderRadius: 26,
            background: "linear-gradient(145deg, rgba(15,15,23,0.95), rgba(31,31,46,0.92))",
            border: isActive ? `1px solid ${meta.accent}66` : "1px solid rgba(255,255,255,0.08)",
            boxShadow: isActive
              ? "0 25px 50px rgba(79, 70, 229, 0.35)"
              : "0 20px 45px rgba(2, 6, 23, 0.6)",
            padding: 22,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            color: "#f8fafc",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {isEditing ? (
              <input
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitRename();
                  if (event.key === "Escape") cancelRename();
                }}
                autoFocus
                style={{
                  flex: 1,
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(15,23,42,0.6)",
                  color: "#f8fafc",
                  padding: "10px 12px",
                  fontSize: 17,
                  fontWeight: 600,
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => handleSelect(project.id)}
                style={{
                  flex: 1,
                  textAlign: "left",
                  border: "none",
                  background: "transparent",
                  color: "inherit",
                  fontSize: 22,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {project.name}
              </button>
            )}
            <span
              style={{
                borderRadius: 999,
                padding: "4px 12px",
                background: `${meta.accent}22`,
                color: meta.accent,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {meta.label}
            </span>
          </div>

          <div style={{ fontSize: 13, color: "#cbd5f5" }}>{meta.description}</div>
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#cbd5f5", flexWrap: "wrap" }}>
            <div>Updated: {lastUpdated}</div>
            {metrics && (
              <>
                <div>Steps: {metrics.totals.totalSteps}</div>
                <div>Cycle: {metrics.averageCycle ? `${metrics.averageCycle.toFixed(1)}m` : "--"}</div>
              </>
            )}
          </div>

          {isEditing ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={commitRename}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: "none",
                  background: "rgba(0, 200, 83, 0.2)",
                  color: "#4ade80",
                  padding: "10px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={cancelRename}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "transparent",
                  color: "#cbd5f5",
                  padding: "10px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleSelect(project.id)}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, rgba(99,102,241,0.85), rgba(14,165,233,0.85))",
                  color: "white",
                  padding: "10px 12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Open Board
              </button>
              <button
                type="button"
                onClick={() => startRename(project.id, project.name)}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.35)",
                  background: "transparent",
                  color: "#cbd5f5",
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => handleDuplicate(project.id)}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.35)",
                  background: "transparent",
                  color: "#cbd5f5",
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => handleOpenInvite(project.id)}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(148,163,184,0.35)",
                  background: "transparent",
                  color: "#cbd5f5",
                  padding: "10px 12px",
                  cursor: "pointer",
                }}
              >
                Invite
              </button>
              <button
                type="button"
                onClick={() => handleDelete(project.id)}
                disabled={deletingId === project.id}
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(248,113,113,0.4)",
                  background: "rgba(248,113,113,0.1)",
                  color: "#fecaca",
                  padding: "10px 12px",
                  cursor: deletingId === project.id ? "not-allowed" : "pointer",
                }}
              >
                {deletingId === project.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      );
    });
  }, [
    commitRename,
    deletingId,
    handleDelete,
    handleSelect,
    handleDuplicate,
    projects,
    projectsError,
    projectsLoading,
    renameTarget,
    renameValue,
    startRename,
    selectedProjectId,
    cancelRename,
  ]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        background: "radial-gradient(circle at top, rgba(79,70,229,0.35), rgba(15,23,42,0.95) 55%)",
        color: "#f8fafc",
        padding: "60px 20px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>Choose a workspace</h1>
        <p style={{ color: "#cbd5f5" }}>Every workspace can adopt an industry profile with tailored nodes and KPIs.</p>
      </div>

      <button
        type="button"
        onClick={requestCreate}
        style={{
          borderRadius: 999,
          border: "none",
          padding: "12px 28px",
          background: "linear-gradient(120deg, rgba(99,102,241,0.95), rgba(14,165,233,0.95))",
          color: "white",
          fontWeight: 700,
          letterSpacing: 0.4,
          cursor: "pointer",
          boxShadow: "0 18px 32px rgba(15, 23, 42, 0.45)",
        }}
      >
        + New Project
      </button>

      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: 1100,
        }}
      >
        {projectCards}
      </div>

      {isModalOpen && (
        <CreateProjectModal
          isSubmitting={isCreating}
          onCreate={handleCreate}
          onClose={() => {
            if (!isCreating) setIsModalOpen(false);
          }}
        />
      )}
      {inviteProjectId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.75)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (!inviteEmail.trim()) return;
              try {
                if (inviteProjectId) {
                  await sendProjectInvite(inviteProjectId, inviteEmail.trim(), inviteRole);
                }
                setInviteEmail("");
                setInviteProjectId(null);
              } catch (error) {
                console.error("Failed to send invite", error);
              }
            }}
            style={{
              minWidth: 360,
              borderRadius: 20,
              padding: "24px 28px",
              background: "rgba(15,23,42,0.9)",
              color: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <strong>Invite collaborator</strong>
            <input
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="Email address"
              style={{
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "rgba(15,23,42,0.6)",
                color: "#f8fafc",
                padding: "10px 12px",
              }}
            />
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as any)}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "rgba(15,23,42,0.6)",
                color: "#f8fafc",
                padding: "10px 12px",
              }}
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={{ flex: 1, borderRadius: 12, border: "none", background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(14,165,233,0.95))", color: "#fff", padding: "10px 0", fontWeight: 600 }}>
                Send Invite
              </button>
              <button
                type="button"
                onClick={() => setInviteProjectId(null)}
                style={{ flex: 1, borderRadius: 12, border: "1px solid rgba(148,163,184,0.35)", background: "transparent", color: "#cbd5f5", padding: "10px 0" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

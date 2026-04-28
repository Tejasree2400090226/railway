const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api";
const PROJECTS_KEY = "projects";

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const parseMarks = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const raw = String(value).trim();
  const numericChunk = raw.includes("/") ? raw.split("/")[0] : raw;
  const parsed = Number(numericChunk);

  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStatus = (status, reviewedFlag, marks) => {
  if (typeof status === "string" && status.trim()) {
    const clean = status.trim().toLowerCase();
    if (clean === "reviewed") return "Reviewed";
    if (clean === "submitted") return "Submitted";
    if (clean === "pending") return "Pending";
    return status;
  }

  if (reviewedFlag === true || marks !== null) {
    return "Reviewed";
  }

  return "Submitted";
};

const normalizeProject = (project, fallbackEmail = "") => {
  const marks = parseMarks(project?.marks ?? project?.score ?? project?.reviewMarks ?? project?.reviewScore);
  const feedback = project?.feedback ?? project?.reviewFeedback ?? project?.comments ?? "";
  const ownerEmail = (project?.ownerEmail || project?.email || fallbackEmail || "").trim().toLowerCase();

  return {
    ...project,
    ownerEmail,
    marks,
    feedback,
    status: normalizeStatus(project?.status ?? project?.reviewStatus, project?.reviewed, marks)
  };
};

const getLocalProjects = (email) => {
  const projects = readJson(PROJECTS_KEY, []);
  if (!email) {
    return projects;
  }
  const normalizedEmail = email.trim().toLowerCase();
  return projects.filter(
    (project) => (project.ownerEmail || "").trim().toLowerCase() === normalizedEmail
  );
};

const setLocalProjects = (projects) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const addLocalProject = (project) => {
  const projects = readJson(PROJECTS_KEY, []);
  const exists = projects.some((item) => item.id === project.id);
  if (exists) {
    return;
  }
  setLocalProjects([project, ...projects]);
};

const apiRequest = async (path, options = {}) => {
  try {
    const response = await fetch(API_BASE_URL + path, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      ...options
    });

    const raw = await response.text();
    let data = {};

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      return {
        ok: false,
        message: data.message || "Request failed"
      };
    }

    return {
      ok: true,
      data
    };
  } catch {
    return {
      ok: false,
      message: "Unable to connect to backend"
    };
  }
};

export const fetchProjects = async (email) => {
  const cleanEmail = (email || "").trim().toLowerCase();

  const result = await apiRequest(`/projects?email=${encodeURIComponent(cleanEmail)}`);

  if (result.ok && Array.isArray(result.data)) {
    const projects = result.data.map((project) => normalizeProject(project, cleanEmail));

    const existingLocalProjects = readJson(PROJECTS_KEY, []);
    const nonOwned = existingLocalProjects.filter(
      (project) => (project.ownerEmail || "").trim().toLowerCase() !== cleanEmail
    );
    setLocalProjects([...projects, ...nonOwned]);

    return {
      ok: true,
      data: projects,
      source: "backend"
    };
  }

  return {
    ok: true,
    data: getLocalProjects(cleanEmail).map((project) => normalizeProject(project, cleanEmail)),
    source: "local"
  };
};

export const createProject = async (project, ownerEmail) => {
  const cleanEmail = (ownerEmail || "").trim().toLowerCase();
  const payload = {
    ...project,
    ownerEmail: cleanEmail
  };

  const result = await apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  if (result.ok) {
    const savedProject = {
      ...payload,
      ...(result.data || {})
    };

    addLocalProject(savedProject);

    return {
      ok: true,
      data: savedProject,
      source: "backend"
    };
  }

  addLocalProject(payload);

  return {
    ok: true,
    data: payload,
    source: "local",
    message: "Saved locally because backend project endpoint is unavailable."
  };
};

export const fetchAllProjects = async () => {
  const result = await apiRequest("/projects/all");

  if (result.ok && Array.isArray(result.data)) {
    const projects = result.data.map((project) => normalizeProject(project));
    return {
      ok: true,
      data: projects,
      source: "backend"
    };
  }

  return {
    ok: true,
    data: readJson(PROJECTS_KEY, []).map((project) => normalizeProject(project)),
    source: "local"
  };
};

export const reviewProject = async ({ projectId, marks, feedback }) => {
  const result = await apiRequest(`/projects/${projectId}/review`, {
    method: "PATCH",
    body: JSON.stringify({
      marks: Number(marks),
      feedback,
      status: "Reviewed"
    })
  });

  if (result.ok) {
    const projects = readJson(PROJECTS_KEY, []).map((project) =>
      project.id === projectId || project.localId === projectId
        ? normalizeProject({
            ...project,
            marks: Number(marks),
            feedback,
            status: "Reviewed"
          })
        : project
    );
    setLocalProjects(projects);

    return {
      ok: true,
      source: "backend",
      data: result.data
    };
  }

  const projects = readJson(PROJECTS_KEY, []).map((project) =>
    project.id === projectId || project.localId === projectId
      ? normalizeProject({
          ...project,
          marks: Number(marks),
          feedback,
          status: "Reviewed"
        })
      : project
  );
  setLocalProjects(projects);

  return {
    ok: true,
    source: "local",
    message: "Review saved locally because backend review endpoint is unavailable."
  };
};

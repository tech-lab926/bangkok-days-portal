const BASE = "/api/v1/admin";

async function fetchApi(path: string, options?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const json = await res.json();
  if (!json.success) {
    if (res.status === 403) {
      throw new Error("この操作を行う権限がありません");
    }
    throw new Error(json.error || "エラーが発生しました");
  }
  return json.data;
}

// Stores
export const storesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchApi(`/stores${qs}`);
  },
  get: (id: string) => fetchApi(`/stores/${id}`),
  create: (data: any) =>
    fetchApi("/stores", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi(`/stores?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/stores?id=${id}`, { method: "DELETE" }),
  toggleVisibility: (id: string, isVisible: boolean) =>
    fetchApi(`/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isVisible }),
    }),
};

// Areas
export const areasApi = {
  list: () => fetchApi("/areas"),
  create: (data: any) =>
    fetchApi("/areas", { method: "POST", body: JSON.stringify(data) }),
  bulkUpdate: (data: any[]) =>
    fetchApi("/areas", { method: "PUT", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi("/areas", { method: "PUT", body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => fetchApi(`/areas?id=${id}`, { method: "DELETE" }),
};

// Categories
export const categoriesApi = {
  list: () => fetchApi("/categories"),
  create: (data: any) =>
    fetchApi("/categories", { method: "POST", body: JSON.stringify(data) }),
  bulkUpdate: (data: any[]) =>
    fetchApi("/categories", { method: "PUT", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi("/categories", { method: "PUT", body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) =>
    fetchApi(`/categories?id=${id}`, { method: "DELETE" }),
};

// Scenes
export const scenesApi = {
  list: () => fetchApi("/scenes"),
  create: (data: any) =>
    fetchApi("/scenes", { method: "POST", body: JSON.stringify(data) }),
  bulkUpdate: (data: any[]) =>
    fetchApi("/scenes", { method: "PUT", body: JSON.stringify(data) }),
};

// Tags
export const tagsApi = {
  list: () => fetchApi("/tags"),
  create: (data: any) =>
    fetchApi("/tags", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi("/tags", {
      method: "PATCH",
      body: JSON.stringify({ id, ...data }),
    }),
  delete: (id: string) => fetchApi(`/tags?id=${id}`, { method: "DELETE" }),
};

// Owners
export const ownersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchApi(`/owners${qs}`);
  },
  create: (data: any) =>
    fetchApi("/owners", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi(`/owners?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/owners?id=${id}`, { method: "DELETE" }),
};

// Pricing Plans
export const pricingPlansApi = {
  list: () => fetchApi("/pricing-plans"),
  create: (data: any) =>
    fetchApi("/pricing-plans", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi(`/pricing-plans?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    fetchApi(`/pricing-plans?id=${id}`, { method: "DELETE" }),
};

// Revenue
export const revenueApi = {
  list: (year: number, month: number) =>
    fetchApi(`/revenue?year=${year}&month=${month}`),
  generate: (year: number, month: number) =>
    fetchApi("/revenue", {
      method: "POST",
      body: JSON.stringify({ year, month }),
    }),
  updateStatus: (id: string, status: string) =>
    fetchApi(`/revenue?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Inquiries
export const inquiriesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchApi(`/inquiries${qs}`);
  },
  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${BASE}/inquiries?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || "エラーが発生しました");
    }
    return json.data;
  },
};

// Featured Pages
export const featuredPagesApi = {
  list: () => fetchApi("/featured-pages"),
  save: (data: any[]) =>
    fetchApi("/featured-pages", { method: "PUT", body: JSON.stringify(data) }),
};

// Settings
export const settingsApi = {
  get: () => fetchApi("/settings"),
  save: (data: Record<string, string>) =>
    fetchApi("/settings", { method: "PUT", body: JSON.stringify(data) }),
};

// Google Maps
export const googleMapsApi = {
  extractPlaceInfo: (url: string) =>
    fetchApi("/google-maps/extract", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
};

// Articles
export const articlesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchApi(`/articles${qs}`);
  },
  get: (id: string) => fetchApi(`/articles/${id}`),
  create: (data: any) =>
    fetchApi("/articles", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi(`/articles?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => fetchApi(`/articles?id=${id}`, { method: "DELETE" }),
  togglePublish: (id: string, published: boolean) =>
    fetchApi(`/articles/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
    }),
};

// Jobs
export const jobsApi = {
  list: () => fetchApi("/jobs"),
  create: (data: any) => fetchApi("/jobs", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/jobs?id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/jobs?id=${id}`, { method: "DELETE" }),
}

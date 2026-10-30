import { preferences } from "@/i18n/server";
import { localize } from "@/i18n/core";
import type { ApiResponse, Content, Project } from "@/types/api";
import { cache } from "react";
const origin = () => process.env.API_INTERNAL_URL || "http://127.0.0.1:8000";
export class UpstreamError extends Error {
  constructor(public status: number) {
    super("Content service unavailable");
  }
}
async function serverEnvelope<T>(path: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${origin()}/api/v1/${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new UpstreamError(response.status);
  const body: ApiResponse<T> = await response.json();
  return body;
}
async function serverRead<T>(path: string): Promise<T> {
  return localize(
    (await serverEnvelope<T>(path)).data,
    (await preferences()).locale,
  );
}
export const getContent = cache(() => serverRead<Content>("content/"));
export const getProject = cache((slug: string) =>
  serverRead<Project>(`projects/${encodeURIComponent(slug)}/`),
);
export async function getProjectIndex(): Promise<Project[]> {
  const projects: Project[] = [];
  for (let page = 1; ; page += 1) {
    const response = await serverEnvelope<Project[]>(
      `projects/?page_size=100&page=${page}`,
    );
    projects.push(...response.data);
    if (!response.meta.pagination?.has_next) return projects;
  }
}

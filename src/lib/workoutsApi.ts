export type WorkoutBrowseItem = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  category: string | null;
  searchText: string;
};

export type WorkoutDetailResponse = {
  id: string;
  slug: string;
  title: string;
  provider: string;
  category: string | null;
  description: {
    general?: string | null;
    price?: string | null;
  } | null;
  price?: {
    student?: number | null;
    staff?: number | null;
    external?: number | null;
    externalReduced?: number | null;
    adults?: number | null;
    children?: number | null;
    discount?: number | null;
  };
  schedule: Array<{
    day: string;
    time: string;
    location: string;
  }>;
  location: string[] | null;
  url: string | null;
  instructor?: string;
  startDate?: string;
  endDate?: string;
  bookingStatus?: string;
  semester?: string;
  isEntgeltfrei?: boolean;
  bookingLabel?: string;
  bookingOpensOn?: string;
  bookingOpensAt?: string;
  plannedDates?: string[];
  durationUrl?: string;
};

export type SnapshotManifest = {
  detailKey: string;
  titleLocaleKey: string;
  categoryLocaleKey: string;
};

import { loadWorkoutLocaleMaps } from "./workoutLocaleMaps";

export type ApiFetch = typeof fetch;

export function buildWorkoutsManifestUrl(baseUrl: string): string {
  return new URL("/workouts/manifest.json", baseUrl).toString();
}

export function buildSnapshotAssetUrl(baseUrl: string, key: string): string {
  return new URL(`/${key.replace(/^\/+/, "")}`, baseUrl).toString();
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(
      `Snapshot request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export async function loadWorkoutDetailCatalogFromSnapshot(
  baseUrl: string,
  fetchImpl: ApiFetch = fetch,
): Promise<Record<string, WorkoutDetailResponse>> {
  const manifest = await readJson<SnapshotManifest>(
    await fetchImpl(buildWorkoutsManifestUrl(baseUrl)),
  );

  const [detailCatalog] = await Promise.all([
    readJson<Record<string, WorkoutDetailResponse>>(
      await fetchImpl(buildSnapshotAssetUrl(baseUrl, manifest.detailKey)),
    ),
    loadWorkoutLocaleMaps(baseUrl, {
      titleLocaleKey: manifest.titleLocaleKey,
      categoryLocaleKey: manifest.categoryLocaleKey,
    }, fetchImpl),
  ]);

  return detailCatalog;
}

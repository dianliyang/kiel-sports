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
  generatedAt?: string;
  updatedAt?: string;
  detailKey: string;
  titleLocaleKey: string;
  categoryLocaleKey: string;
  wikipediaLocaleKey?: string;
  metadataLocaleKey?: string;
  metadataKey?: string;
};

export type WorkoutDescriptionMetadata = {
  description?: {
    general?: Partial<Record<WorkoutLocale | "original", string>>;
    price?: Partial<Record<WorkoutLocale | "original", string>>;
  };
};

export type WorkoutDescriptionMetadataMap = Record<
  string,
  WorkoutDescriptionMetadata
>;

export type WorkoutSnapshotCatalog = {
  updatedAt?: string;
  catalog: Record<string, WorkoutDetailResponse>;
  descriptionMetadata: WorkoutDescriptionMetadataMap;
};

import { loadWorkoutLocaleMaps } from "./workoutLocaleMaps";
import { setWorkoutCategoryWikipediaMap, type WorkoutCategoryWikipediaMap } from "./workoutCategoryWikipediaMap";
import type { WorkoutLocale } from "./workoutLocales";
import {
  buildWorkoutSnapshotAssetUrl,
  readWorkoutSnapshotJson,
} from "./workoutSnapshotUtils";

export type ApiFetch = typeof fetch;

export function buildWorkoutsManifestUrl(baseUrl: string): string {
  return new URL("/workouts/manifest.json", baseUrl).toString();
}

export function buildSnapshotAssetUrl(baseUrl: string, key: string): string {
  return buildWorkoutSnapshotAssetUrl(baseUrl, key);
}

function resolveDescriptionText(
  localized:
    | Partial<Record<WorkoutLocale | "original", string>>
    | undefined,
  locale: WorkoutLocale,
  fallback: string | null | undefined,
): string | null | undefined {
  return localized?.[locale] ?? localized?.original ?? fallback;
}

export function localizeWorkoutCatalogDescriptions(
  catalog: Record<string, WorkoutDetailResponse>,
  descriptionMetadata: WorkoutDescriptionMetadataMap,
  locale: WorkoutLocale,
): Record<string, WorkoutDetailResponse> {
  return Object.fromEntries(
    Object.entries(catalog).map(([id, record]) => {
      const metadata = descriptionMetadata[id];
      if (!metadata?.description) {
        return [id, record];
      }

      return [id, {
        ...record,
        description: {
          ...record.description,
          general: resolveDescriptionText(
            metadata.description.general,
            locale,
            record.description?.general,
          ),
          price: resolveDescriptionText(
            metadata.description.price,
            locale,
            record.description?.price,
          ),
        },
      }];
    }),
  );
}

export async function loadWorkoutDetailCatalogFromSnapshot(
  baseUrl: string,
  fetchImpl: ApiFetch = fetch,
): Promise<WorkoutSnapshotCatalog> {
  const manifest = await readJson<SnapshotManifest>(
    await fetchImpl(buildWorkoutsManifestUrl(baseUrl)),
  );

  const metadataKey = manifest.metadataLocaleKey ?? manifest.metadataKey;

  const [detailCatalog, _localeMaps, descriptionMetadata, wikipediaMap] = await Promise.all([
    readJson<Record<string, WorkoutDetailResponse>>(
      await fetchImpl(buildSnapshotAssetUrl(baseUrl, manifest.detailKey)),
    ),
    loadWorkoutLocaleMaps(baseUrl, {
      titleLocaleKey: manifest.titleLocaleKey,
      categoryLocaleKey: manifest.categoryLocaleKey,
    }, fetchImpl),
    metadataKey
      ? readJson<WorkoutDescriptionMetadataMap>(
        await fetchImpl(buildSnapshotAssetUrl(baseUrl, metadataKey)),
      )
      : Promise.resolve({}),
    manifest.wikipediaLocaleKey
      ? readJson<WorkoutCategoryWikipediaMap>(
        await fetchImpl(
          buildSnapshotAssetUrl(baseUrl, manifest.wikipediaLocaleKey),
        ),
      )
      : Promise.resolve({}),
  ]);

  setWorkoutCategoryWikipediaMap(wikipediaMap);

  return {
    updatedAt: manifest.generatedAt ?? manifest.updatedAt,
    catalog: detailCatalog,
    descriptionMetadata,
  };
}

const readJson = readWorkoutSnapshotJson;

export type { WorkoutLocale } from "./workoutLocales";

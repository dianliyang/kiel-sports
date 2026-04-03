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
  sessionCount?: number;
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

export type LocaleValue = {
  digest: string;
  de: string;
  en: string;
  ja: string;
  ko: string;
  "zh-CN": string;
};

export type WorkoutMetadata = {
  page: {
    [categoryName: string]: {
      [providerName: string]: {
        note?: LocaleValue;
      };
    };
  };
  entries: {
    [id: string]: {
      general?: LocaleValue;
      price?: LocaleValue;
    };
  };
};

export type WorkoutSnapshotCatalog = {
  updatedAt?: string;
  catalog: Record<string, WorkoutDetailResponse>;
  metadata: WorkoutMetadata;
};

import { loadWorkoutLocaleMaps } from "./workoutLocaleMaps";
import {
  setWorkoutCategoryWikipediaMap,
  type WorkoutCategoryWikipediaMap,
} from "./workoutCategoryWikipediaMap";
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
  localized: LocaleValue | undefined,
  locale: WorkoutLocale,
): string | undefined {
  const localizedValue = localized?.[locale]?.trim();
  if (localizedValue) return localizedValue;

  const fallback = localized?.en?.trim();
  return fallback || undefined;
}

export function localizeWorkoutCatalogDescriptions(
  catalog: Record<string, WorkoutDetailResponse>,
  metadata: WorkoutMetadata,
  locale: WorkoutLocale,
): Record<string, WorkoutDetailResponse> {
  return Object.fromEntries(
    Object.entries(catalog).map(([id, record]) => {
      const entry = metadata.entries[id];
      const generalMetadata = resolveDescriptionText(entry?.general, locale);
      const priceMetadata = resolveDescriptionText(entry?.price, locale);

      const general = generalMetadata ?? record.description?.general;
      const price = priceMetadata ?? record.description?.price;

      return [
        id,
        {
          ...record,
          description: general || price ? { general, price } : null,
        },
      ];
    }),
  );
}

export function localizeWorkoutPageNote(
  metadata: WorkoutMetadata,
  category: string,
  locale: WorkoutLocale,
): Record<string, string> {
  const providerEntries = metadata.page[category];
  if (!providerEntries) return {};

  return Object.fromEntries(
    Object.entries(providerEntries)
      .map(
        ([provider, value]) =>
          [provider, resolveDescriptionText(value.note, locale)] as const,
      )
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

function normalizeWorkoutMetadata(
  metadata: Partial<WorkoutMetadata> | null | undefined,
): WorkoutMetadata {
  return {
    page: metadata?.page ?? {},
    entries: metadata?.entries ?? {},
  };
}

export async function loadWorkoutDetailCatalogFromSnapshot(
  baseUrl: string,
  fetchImpl: ApiFetch = fetch,
): Promise<WorkoutSnapshotCatalog> {
  const manifest = await readJson<SnapshotManifest>(
    await fetchImpl(buildWorkoutsManifestUrl(baseUrl)),
  );

  const metadataKey = manifest.metadataLocaleKey ?? manifest.metadataKey;

  const [detailCatalog, _localeMaps, rawMetadata, rawWikipediaMap] =
    await Promise.all([
      readJson<Record<string, WorkoutDetailResponse>>(
        await fetchImpl(buildSnapshotAssetUrl(baseUrl, manifest.detailKey)),
      ),
      loadWorkoutLocaleMaps(
        baseUrl,
        {
          titleLocaleKey: manifest.titleLocaleKey,
          categoryLocaleKey: manifest.categoryLocaleKey,
        },
        fetchImpl,
      ),
      metadataKey
        ? readOptionalJson<WorkoutMetadata>(
            await fetchImpl(buildSnapshotAssetUrl(baseUrl, metadataKey)),
          )
        : Promise.resolve({}),
      manifest.wikipediaLocaleKey
        ? readOptionalJson<WorkoutCategoryWikipediaMap>(
            await fetchImpl(
              buildSnapshotAssetUrl(baseUrl, manifest.wikipediaLocaleKey),
            ),
          )
        : Promise.resolve({}),
    ]);

  const metadata = normalizeWorkoutMetadata(rawMetadata);
  const wikipediaMap = rawWikipediaMap ?? {};

  setWorkoutCategoryWikipediaMap(wikipediaMap);

  return {
    updatedAt: manifest.generatedAt ?? manifest.updatedAt,
    catalog: detailCatalog,
    metadata,
  };
}

const readJson = readWorkoutSnapshotJson;

async function readOptionalJson<T>(response: Response): Promise<T | null> {
  if (response.status === 404) {
    return null;
  }

  return readWorkoutSnapshotJson<T>(response);
}

export type { WorkoutLocale } from "./workoutLocales";

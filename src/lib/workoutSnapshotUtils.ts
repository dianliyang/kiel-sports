export function buildWorkoutSnapshotAssetUrl(
  baseUrl: string,
  key: string,
): string {
  return new URL(`/${key.replace(/^\/+/, "")}`, baseUrl).toString();
}

export async function readWorkoutSnapshotJson<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    throw new Error(
      `Snapshot request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

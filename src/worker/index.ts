import { filterWorkouts, paginateWorkouts, type WorkoutBrowseRecord } from "./filtering";
import { loadSnapshotSet, type R2BucketLike } from "./r2";

type WorkoutDetailRecord = {
  slug: string;
  [key: string]: unknown;
};

type WorkerDeps = {
  bucket: R2BucketLike;
  baseKey?: string;
};

async function handleBrowse(request: Request, deps: WorkerDeps) {
  const { browse } = await loadSnapshotSet<WorkoutBrowseRecord[], Record<string, WorkoutDetailRecord>>(
    deps.bucket,
    deps.baseKey || "workouts",
  );

  const url = new URL(request.url);
  const filtered = filterWorkouts(browse, {
    q: url.searchParams.get("q") || "",
    provider: url.searchParams.get("provider") || "",
    category: url.searchParams.get("category") || "",
  });

  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") || "20"));

  return Response.json(paginateWorkouts(filtered, page, pageSize));
}

async function handleDetail(slug: string, deps: WorkerDeps) {
  const { detail } = await loadSnapshotSet<WorkoutBrowseRecord[], Record<string, WorkoutDetailRecord>>(
    deps.bucket,
    deps.baseKey || "workouts",
  );

  const record = detail[slug];
  if (!record) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(record);
}

export function createWorkoutsWorker(deps: WorkerDeps) {
  return {
    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, "");

      if (request.method !== "GET") {
        return Response.json({ error: "Method not allowed" }, { status: 405 });
      }

      if (path === "/api/workouts") {
        return handleBrowse(request, deps);
      }

      if (path.startsWith("/api/workouts/")) {
        const slug = path.slice("/api/workouts/".length);
        return handleDetail(slug, deps);
      }

      return Response.json({ error: "Not found" }, { status: 404 });
    },
  };
}

const envBucket = {
  async get() {
    throw new Error("R2 bucket binding is not configured");
  },
};

export default createWorkoutsWorker({ bucket: envBucket });

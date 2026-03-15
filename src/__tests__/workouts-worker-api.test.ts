import { describe, expect, test } from "vitest";
import { createWorkoutsWorker } from "../worker/index";

type FakeBucket = {
  get(key: string): Promise<string | null>;
};

const manifest = {
  version: "2026-03-15T12:00:00.000Z",
  generatedAt: "2026-03-15T12:00:00.000Z",
  browseKey: "workouts/browse/2026-03-15T12:00:00.000Z.json",
  detailKey: "workouts/detail/2026-03-15T12:00:00.000Z.json",
  itemCount: 3,
};

const browse = [
  {
    id: "spin-intervals",
    slug: "spin-intervals-monday-evening",
    title: "Spin Intervals",
    provider: "UniSport",
    category: "Cycling",
    weekday: "Monday",
    timeLabel: "18:00-19:00",
    location: "Studio A",
    bookingUrl: "https://example.com/book/spin",
    excerpt: "High-intensity bike intervals.",
    searchText: "spin intervals unisport cycling monday studio a",
  },
  {
    id: "yoga-flow",
    slug: "yoga-flow-wednesday-lunch",
    title: "Yoga Flow",
    provider: "Campus Active",
    category: "Yoga",
    weekday: "Wednesday",
    timeLabel: "12:00-13:00",
    location: "Hall B",
    bookingUrl: "https://example.com/book/yoga",
    excerpt: "Midday mobility and balance.",
    searchText: "yoga flow campus active yoga wednesday hall b",
  },
  {
    id: "boxing-basics",
    slug: "boxing-basics-friday-night",
    title: "Boxing Basics",
    provider: "UniSport",
    category: "Combat",
    weekday: "Friday",
    timeLabel: "19:00-20:00",
    location: "Gym C",
    bookingUrl: "https://example.com/book/boxing",
    excerpt: "Introductory boxing drills.",
    searchText: "boxing basics unisport combat friday gym c",
  },
];

const detail = {
  "spin-intervals-monday-evening": {
    id: "spin-intervals",
    slug: "spin-intervals-monday-evening",
    title: "Spin Intervals",
    provider: "UniSport",
    category: "Cycling",
    description: "High-intensity interval training on stationary bikes.",
    schedule: ["Monday 18:00-19:00"],
    location: "Studio A",
    bookingUrl: "https://example.com/book/spin",
    url: "https://example.com/workouts/spin",
  },
};

function createBucket(): FakeBucket {
  const store = new Map<string, string>([
    ["workouts/manifest.json", JSON.stringify(manifest)],
    [manifest.browseKey, JSON.stringify(browse)],
    [manifest.detailKey, JSON.stringify(detail)],
  ]);

  return {
    async get(key: string) {
      return store.get(key) ?? null;
    },
  };
}

describe("workouts worker api", () => {
  test("returns paginated browse results", async () => {
    const worker = createWorkoutsWorker({ bucket: createBucket() });

    const response = await worker.fetch(new Request("https://example.com/api/workouts?page=1&pageSize=2"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(2);
    expect(body.total).toBe(3);
  });

  test("filters by q, provider, and category", async () => {
    const worker = createWorkoutsWorker({ bucket: createBucket() });

    const response = await worker.fetch(
      new Request("https://example.com/api/workouts?q=boxing&provider=UniSport&category=Combat"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].slug).toBe("boxing-basics-friday-night");
  });

  test("returns a workout detail record by slug", async () => {
    const worker = createWorkoutsWorker({ bucket: createBucket() });

    const response = await worker.fetch(
      new Request("https://example.com/api/workouts/spin-intervals-monday-evening"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.slug).toBe("spin-intervals-monday-evening");
    expect(body.schedule).toEqual(["Monday 18:00-19:00"]);
  });
});

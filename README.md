# athena-workouts-public

Static VitePress site for Sports in Kiel. The site builds from published workout snapshot JSON and generates one page per workout category under `docs/workouts/`.

## Build Input

The docs build fetches published snapshot files from `https://athena-public-snapshots.oili.workers.dev` by default. Set `WORKOUTS_SNAPSHOT_BASE_URL` or `VITEPRESS_WORKOUTS_SNAPSHOT_BASE_URL` to override that base URL for local or preview builds.

## Commands

- `npm test -- --run`
- `npm run build`

## Deployment

Serve this repo as a static site with Docker Compose. The image builds the VitePress site, then serves the generated files from `nginx`.

### Run with Docker Compose

Build and start the container:

```bash
docker compose up --build
```

With OrbStack, the site is available at `http://sport.orb.local`.

You can stop it with `Ctrl+C`, or run it detached with:

```bash
docker compose up --build -d
```

### OrbStack Browser Access

The Compose service is configured with an OrbStack custom domain:

- `http://sport.orb.local`

If the domain works in Safari but not in another browser such as Arc, check the macOS app permission for that browser:

- `System Settings` → `Privacy & Security` → `Local Network`
- enable access for the browser you are using

Without the `Local Network` permission, Chromium-based browsers may fail to reach OrbStack container domains even when DNS resolution succeeds.

Snapshot generation and publishing still stay in the separate `athena-public-snapshots` Worker project.

### Build Configuration

The Docker build uses the same snapshot source configuration as local builds. Set `WORKOUTS_SNAPSHOT_BASE_URL` or `VITEPRESS_WORKOUTS_SNAPSHOT_BASE_URL` when you need a different snapshot source during image builds.

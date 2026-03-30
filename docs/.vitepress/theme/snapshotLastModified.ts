type LastUpdatedThemeConfig = {
  text?: string;
  formatOptions?: Intl.DateTimeFormatOptions & { forceLocale?: boolean };
};

const defaultFormatOptions = {
  dateStyle: "short",
  timeStyle: "short",
  forceLocale: true,
} as const;

const lastUpdatedLabels: Array<[string, string]> = [
  ["de", "Zuletzt aktualisiert"],
  ["ja", "最終更新"],
  ["ko", "마지막 업데이트"],
  ["zh", "最后更新"],
  ["en", "Last updated"],
];

export function resolveLastUpdatedConfig(
  locale: string,
  config: LastUpdatedThemeConfig | boolean | undefined,
): LastUpdatedThemeConfig {
  if (config && typeof config === "object") {
    return {
      text: config.text,
      formatOptions: config.formatOptions ?? defaultFormatOptions,
    };
  }

  const normalizedLocale = locale.toLowerCase();
  const label =
    lastUpdatedLabels.find(([prefix]) =>
      normalizedLocale.startsWith(prefix),
    )?.[1] ?? "Last updated";

  return {
    text: label,
    formatOptions: defaultFormatOptions,
  };
}

export function resolveSnapshotLastModified(
  locale: string,
  frontmatter: Record<string, unknown>,
  config: LastUpdatedThemeConfig,
): { label: string; datetime: string; text: string } | null {
  const datetime =
    typeof frontmatter.snapshotUpdatedAt === "string"
      ? frontmatter.snapshotUpdatedAt
      : null;

  if (!datetime) return null;

  const normalizedDatetime = normalizeSnapshotDatetime(datetime);

  const date = new Date(normalizedDatetime);
  if (Number.isNaN(date.getTime())) return null;

  const formatOptions = config.formatOptions ?? defaultFormatOptions;
  const { forceLocale: _forceLocale, ...intlOptions } = formatOptions;

  return {
    label: config.text ?? "Last updated",
    datetime,
    text: new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      ...intlOptions,
    }).format(date),
  };
}

export function normalizeSnapshotDatetime(datetime: string): string {
  return datetime.replace(
    /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    "$1T$2:$3:$4.$5Z",
  );
}

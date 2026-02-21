export async function runListingIngestionJob({ source, records }) {
  if (!source) {
    throw new Error("source is required");
  }

  let processed = 0;
  let failed = 0;
  const normalized = [];

  for (const record of records ?? []) {
    if (!record.name || !record.metro || !record.listingType) {
      failed += 1;
      continue;
    }
    normalized.push({
      name: record.name.trim(),
      metro: record.metro.trim(),
      listingType: record.listingType,
      website: record.website ?? null
    });
    processed += 1;
  }

  return { source, processed, failed, normalized, completedAt: new Date().toISOString() };
}

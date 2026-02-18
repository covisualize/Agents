export async function runPayrollIngestionJob({ sourceName, records }) {
  if (!sourceName) {
    throw new Error("sourceName is required");
  }

  const normalized = [];
  const errors = [];

  for (const record of records ?? []) {
    try {
      if (!record.workerId || !record.hours || !record.workDate || !record.wageRate) {
        throw new Error("missing required fields");
      }
      normalized.push({
        workerId: record.workerId,
        workDate: record.workDate,
        hours: Number(record.hours),
        wageRate: Number(record.wageRate),
        sourceName
      });
    } catch (error) {
      errors.push({
        record,
        message: error.message
      });
    }
  }

  return {
    sourceName,
    processed: normalized.length,
    failed: errors.length,
    normalized,
    errors,
    completedAt: new Date().toISOString()
  };
}

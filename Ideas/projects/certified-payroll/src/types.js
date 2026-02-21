export const PayrollRunStatus = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  REJECTED: "rejected",
  CORRECTED: "corrected"
});

export const ReportStatus = Object.freeze({
  DRAFT: "draft",
  SUBMITTED: "submitted",
  REJECTED: "rejected",
  ACCEPTED: "accepted"
});

export const CorrectionReasonCode = Object.freeze({
  HOURS_MISMATCH: "hours_mismatch",
  CLASSIFICATION_MISMATCH: "classification_mismatch",
  FRINGE_MISMATCH: "fringe_mismatch",
  OTHER: "other"
});

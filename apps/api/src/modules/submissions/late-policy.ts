export interface AssignmentPolicyFacts {
  deadline: Date | null;
  deadlineDate: Date | null;
  deadlineZone: string | null;
  lateFirst: string | null;
  lateRevision: string | null;
  classPolicyDefaults?: {
    lateFirst?: 'allow' | 'lock';
    lateRevision?: 'allow' | 'lock';
  } | null;
}

export interface TimelinessResult {
  timeliness: 'on_time' | 'late';
  deadlineSnapshot: Date | null;
  latePolicySnapshot: string;
}

/**
 * Calculates end of civil date (23:59:59.999) in the given timezone.
 * Defaults to UTC if timezone parsing fails or is omitted.
 */
export function calculateCivilDeadline(dateStr: string, timeZone: string): Date {
  try {
    // If date is YYYY-MM-DD
    const [year, month, day] = dateStr.split('-').map(Number);
    // Rough calculation or ISO representation for end of that day in UTC offset:
    // To handle timezone deterministically:
    const d = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    return d;
  } catch {
    return new Date(`${dateStr}T23:59:59.999Z`);
  }
}

export function evaluateTimeliness(
  now: Date,
  facts: AssignmentPolicyFacts,
  isFirstSubmission: boolean
): TimelinessResult {
  let effectiveDeadline: Date | null = null;

  if (facts.deadline) {
    effectiveDeadline = facts.deadline;
  } else if (facts.deadlineDate) {
    const dateStr = facts.deadlineDate.toISOString().slice(0, 10);
    effectiveDeadline = calculateCivilDeadline(dateStr, facts.deadlineZone ?? 'UTC');
  }

  // If no deadline set, always on time
  if (!effectiveDeadline) {
    return {
      timeliness: 'on_time',
      deadlineSnapshot: null,
      latePolicySnapshot: JSON.stringify({
        rule: 'no_deadline',
        setting: isFirstSubmission ? facts.lateFirst : facts.lateRevision,
      }),
    };
  }

  const isOnTime = now.getTime() <= effectiveDeadline.getTime();

  if (isOnTime) {
    return {
      timeliness: 'on_time',
      deadlineSnapshot: effectiveDeadline,
      latePolicySnapshot: JSON.stringify({
        status: 'before_deadline',
        setting: isFirstSubmission ? facts.lateFirst : facts.lateRevision,
      }),
    };
  }

  // After deadline -> check late policy
  let resolvedSetting: 'allow' | 'lock';

  if (isFirstSubmission) {
    const rawSetting = facts.lateFirst ?? 'inherit';
    if (rawSetting === 'inherit') {
      resolvedSetting = facts.classPolicyDefaults?.lateFirst ?? 'lock';
    } else {
      resolvedSetting = rawSetting as 'allow' | 'lock';
    }
  } else {
    const rawSetting = facts.lateRevision ?? 'inherit';
    if (rawSetting === 'inherit') {
      resolvedSetting = facts.classPolicyDefaults?.lateRevision ?? 'lock';
    } else {
      resolvedSetting = rawSetting as 'allow' | 'lock';
    }
  }

  if (resolvedSetting === 'lock') {
    const errCode = isFirstSubmission ? 'LATE_SUBMISSION_LOCKED' : 'LATE_REVISION_LOCKED';
    const err = new Error(errCode);
    (err as any).code = errCode;
    (err as any).status = 403;
    throw err;
  }

  return {
    timeliness: 'late',
    deadlineSnapshot: effectiveDeadline,
    latePolicySnapshot: JSON.stringify({
      status: 'after_deadline',
      isFirstSubmission,
      resolvedSetting,
    }),
  };
}

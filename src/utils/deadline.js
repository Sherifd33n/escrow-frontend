/**
 * Calculates time remaining until target dueDate.
 * @param {string|Date} dueDate
 * @returns {{ diffMs: number, diffDays: number, diffHours: number, diffMins: number, isOverdue: boolean, label: string, badgeBg: string, badgeBorder: string, badgeColor: string, formattedDate: string } | null}
 */
export function getDeadlineCountdown(dueDate) {
  if (!dueDate) return null;

  try {
    const isIsoOrHasTime = String(dueDate).includes("T");
    const parsedDate = new Date(isIsoOrHasTime ? dueDate : String(dueDate) + "T00:00:00");
    if (isNaN(parsedDate.getTime())) return null;

    // If no time is included, treat deadline as end of that day (23:59:59)
    const targetTime = isIsoOrHasTime
      ? parsedDate.getTime()
      : new Date(String(dueDate).split("T")[0] + "T23:59:59").getTime();

    const now = Date.now();
    const diffMs = targetTime - now;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    const isOverdue = diffMs < 0;

    let label = "";
    let badgeBg = "#f8fafc";
    let badgeBorder = "#e2e8f0";
    let badgeColor = "#475569";

    if (isOverdue) {
      const overdueDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      if (overdueDays === 0) {
        label = "⚠️ Due today";
        badgeBg = "#fffbeb";
        badgeBorder = "#fde68a";
        badgeColor = "#b45309";
      } else {
        label = `⚠️ ${overdueDays}d overdue`;
        badgeBg = "#fef2f2";
        badgeBorder = "#fecaca";
        badgeColor = "#b91c1c";
      }
    } else if (diffDays === 0) {
      if (diffHours <= 0) {
        label = diffMins <= 0 ? "⏰ Due now" : `⏰ ${diffMins}m left`;
      } else {
        label = `⏰ ${diffHours}h left`;
      }
      badgeBg = "#fffbeb";
      badgeBorder = "#fde68a";
      badgeColor = "#b45309";
    } else if (diffDays === 1) {
      label = "⏰ 1 day left";
      badgeBg = "#fffbeb";
      badgeBorder = "#fde68a";
      badgeColor = "#b45309";
    } else if (diffDays <= 3) {
      label = `⏰ ${diffDays} days left`;
      badgeBg = "#eff6ff";
      badgeBorder = "#bfdbfe";
      badgeColor = "#1d4ed8";
    } else {
      label = `⏰ ${diffDays} days left`;
      badgeBg = "#f0fdf4";
      badgeBorder = "#bbf7d0";
      badgeColor = "#15803d";
    }

    const formattedDate = parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: parsedDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });

    return {
      diffMs,
      diffDays,
      diffHours,
      diffMins,
      isOverdue,
      label,
      badgeBg,
      badgeBorder,
      badgeColor,
      formattedDate,
    };
  } catch {
    return null;
  }
}

// Builds a createdAt range for the optional ?year=&month= filter.
// 0 / missing means "not set"; a month without a year uses the current year.
// The upper bound is exclusive, so the last second of the period is included.
export const periodToCreatedAt = (year?: number, month?: number) => {
  if (!year && !month) {
    return undefined;
  }

  const y = year || new Date().getFullYear();

  return {
    gte: new Date(y, month ? month - 1 : 0, 1),
    lt: new Date(y, month ? month : 12, 1),
  };
};

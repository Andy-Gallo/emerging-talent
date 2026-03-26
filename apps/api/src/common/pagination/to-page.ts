export const toPage = (page?: number, pageSize?: number) => {
  const p = Math.max(1, page ?? 1);
  const s = Math.max(1, Math.min(100, pageSize ?? 20));
  return {
    page: p,
    pageSize: s,
    offset: (p - 1) * s,
  };
};

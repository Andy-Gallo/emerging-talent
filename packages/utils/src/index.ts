export const nowIso = () => new Date().toISOString();

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export const assertNever = (_value: never): never => {
  throw new Error("Unexpected branch reached.");
};

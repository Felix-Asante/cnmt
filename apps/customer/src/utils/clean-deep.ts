export function cleanDeep<T>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj
      .map((item) => cleanDeep(item))
      .filter((item) => item !== null && item !== undefined && item !== "");
  }

  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => [key, cleanDeep(value)])
        .filter(([_, value]) => {
          if (value === null || value === undefined || value === "") {
            return false;
          }
          if (typeof value === "object" && Object.keys(value).length === 0) {
            return false;
          }
          return true;
        }),
    );
  }

  return obj;
}

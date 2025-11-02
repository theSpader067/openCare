export function cn(
  ...classes: Array<
    | string
    | number
    | false
    | null
    | undefined
    | Record<string, boolean>
  >
) {
  const tokens: string[] = [];

  classes.forEach((value) => {
    if (!value && value !== 0) {
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      tokens.push(String(value));
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([key, active]) => {
        if (active) tokens.push(key);
      });
    }
  });

  return tokens.join(" ");
}

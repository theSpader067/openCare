export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

export function getDeviceType(): "mobile" | "desktop" {
  if (typeof window === "undefined") {
    return "desktop";
  }
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

export function getLoginRedirectUrl(): string {
  const deviceType = getDeviceType();
  return deviceType === "mobile" ? "/tasks" : "/dashboard";
}

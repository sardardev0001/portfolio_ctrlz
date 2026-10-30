import type { Social } from "@/types/api";
export function validSocial(social: Social): boolean {
  if (!social.verified) return false;
  try {
    const url = new URL(social.href || social.url);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !/(^|\.)(example\.(com|org|net)|localhost|invalid|test)$/.test(
        url.hostname,
      ) &&
      !/placeholder|your[-_]?username|your[-_]?handle/i.test(url.href)
    );
  } catch {
    return false;
  }
}

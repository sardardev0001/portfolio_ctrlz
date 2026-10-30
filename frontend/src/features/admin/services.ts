import { api } from "@/lib/api";
import type { RecordData } from "@/types/api";

/** Fetch every options page so older media remains selectable. */
export async function getOptions(
  endpoint: string,
): Promise<{ data: RecordData[] }> {
  const rows: RecordData[] = [];
  let page = 1;
  while (true) {
    const response = await api<RecordData[]>(
      `admin/${endpoint}/?page_size=100&page=${page}`,
    );
    rows.push(...response.data);
    if (!response.meta.pagination?.has_next) break;
    page += 1;
  }
  return { data: rows };
}

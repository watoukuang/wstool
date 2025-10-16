import { Tool, KolItem, TwitterItem } from '../types';
// 38.190.226.11:8181
const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://192.168.1.177:8181';
// const BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://watoukuang-api:8181';
async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed ${res.status}`);
  }
  const data = await res.json();
  // backend returns { success, data, message }
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data as T;
  }
  return data as T;
}

export const api = {
  getCexs: () => getJson<Tool[]>('/cexs'),
  getKols: () => getJson<KolItem[]>('/kols'),
  getTwitters: () => getJson<TwitterItem[]>('/twitters'),
};

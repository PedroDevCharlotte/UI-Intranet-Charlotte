import { mutate } from 'swr';

let timer: NodeJS.Timeout | null = null;
let counter = 0;

export function showApiLoader() {
  counter += 1;
  mutate('api/loader', true, false);
  // ensure we hide after 20s max
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    counter = 0;
    mutate('api/loader', false, false);
  }, 20000);
}

export function hideApiLoader() {
  counter = Math.max(0, counter - 1);
  if (counter <= 0) {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    mutate('api/loader', false, false);
  }
}

export function isApiLoaderActive() {
  // read-only helper for components via useSWR('api/loader')
  return Boolean(counter > 0);
}

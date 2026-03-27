"use client";

// Çevrimdışı kuyruk — internet kesildiğinde işlemleri biriktirir,
// bağlantı geldiğinde otomatik gönderir.

interface QueueItem {
  id: string;
  action: string;
  data: Record<string, unknown>;
  timestamp: number;
}

const STORAGE_KEY = "iha-offline-queue";

function getQueue(): QueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueueItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function addToQueue(action: string, data: Record<string, unknown>) {
  const queue = getQueue();
  queue.push({
    id: Date.now().toString(36),
    action,
    data,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function getQueueLength(): number {
  return getQueue().length;
}

export function clearQueue() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getQueueItems(): QueueItem[] {
  return getQueue();
}

export function removeFromQueue(id: string) {
  const queue = getQueue().filter((item) => item.id !== id);
  saveQueue(queue);
}

// İnternet durumunu kontrol et
export function isOnline(): boolean {
  return navigator.onLine;
}

// Bağlantı geldiğinde kuyruğu işle
export function setupOnlineListener(processQueue: () => void) {
  window.addEventListener("online", () => {
    const queue = getQueue();
    if (queue.length > 0) {
      processQueue();
    }
  });
}

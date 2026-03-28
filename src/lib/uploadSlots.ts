/** Slot-based upload model for the builder */

export type SlotStatus = "empty" | "uploading" | "uploaded" | "failed";

export interface UploadSlot {
  slotIndex: number; // 1-based (matches backend)
  file: File | null;
  previewUrl: string | null;
  status: SlotStatus;
  path: string | null;
  token: string | null;
  error: string | null;
  progress: number; // 0-100
}

export function createEmptySlot(slotIndex: number): UploadSlot {
  return {
    slotIndex,
    file: null,
    previewUrl: null,
    status: "empty",
    path: null,
    token: null,
    error: null,
    progress: 0,
  };
}

export function createEmptySlots(): UploadSlot[] {
  return [createEmptySlot(1), createEmptySlot(2), createEmptySlot(3)];
}

/** Compact slots: remove gaps and re-index to 1,2,3 */
export function compactSlots(slots: UploadSlot[]): UploadSlot[] {
  const filled = slots.filter((s) => s.status !== "empty");
  const result: UploadSlot[] = [];
  for (let i = 0; i < 3; i++) {
    if (i < filled.length) {
      result.push({ ...filled[i], slotIndex: i + 1 });
    } else {
      result.push(createEmptySlot(i + 1));
    }
  }
  return result;
}

/** Count active (uploading or uploaded) slots */
export function activeSlotCount(slots: UploadSlot[]): number {
  return slots.filter((s) => s.status === "uploading" || s.status === "uploaded").length;
}

/** Count uploaded (confirmed) slots */
export function uploadedSlotCount(slots: UploadSlot[]): number {
  return slots.filter((s) => s.status === "uploaded").length;
}

/** Check if any slot is still uploading */
export function hasUploadingSlots(slots: UploadSlot[]): boolean {
  return slots.some((s) => s.status === "uploading");
}

/** Find first empty slot index (1-based), or null if full */
export function firstEmptySlotIndex(slots: UploadSlot[]): number | null {
  const slot = slots.find((s) => s.status === "empty");
  return slot ? slot.slotIndex : null;
}

/** How many slots are available */
export function availableSlotCount(slots: UploadSlot[]): number {
  return slots.filter((s) => s.status === "empty").length;
}

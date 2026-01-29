import { create } from "zustand";

interface PhotoStore {
  capturedPhotos: string[];
  setCapturedPhotos: (photos: string[]) => void;
  clearPhotos: () => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  capturedPhotos: [],
  setCapturedPhotos: (photos) => set({ capturedPhotos: photos }),
  clearPhotos: () => set({ capturedPhotos: [] }),
}));

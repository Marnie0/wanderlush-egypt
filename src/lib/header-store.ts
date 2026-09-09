import { create } from "zustand";
import { useEffect } from "react";

interface HeaderState {
  /** A page that would normally sit under a floating header but has no hero. */
  solid: boolean;
  setSolid: (solid: boolean) => void;
}

/**
 * The header decides whether to float from the URL pattern, because it paints
 * before the page does. A destination or journey URL with an unknown slug
 * matches the pattern but renders a not-found page with no photograph, so the
 * page corrects the header once it knows.
 */
export const useHeaderStore = create<HeaderState>()((set) => ({
  solid: false,
  setSolid: (solid) => set({ solid }),
}));

export function useSolidHeader(active: boolean) {
  const setSolid = useHeaderStore((state) => state.setSolid);
  useEffect(() => {
    setSolid(active);
    return () => setSolid(false);
  }, [active, setSolid]);
}

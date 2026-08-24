import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_FAVORITES } from "@/services/aqiService";

interface LocationState {
  locationId: string;
  favorites: string[];
  setLocationId: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

const LocationContext = createContext<LocationState>({
  locationId: "meerut",
  favorites: DEFAULT_FAVORITES,
  setLocationId: () => {},
  toggleFavorite: () => {},
});

const KEY_LOC = "saanscheck.location";
const KEY_FAV = "saanscheck.favorites";

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationIdState] = useState("meerut");
  const [favorites, setFavorites] = useState<string[]>(DEFAULT_FAVORITES);

  useEffect(() => {
    const loc = window.localStorage.getItem(KEY_LOC);
    if (loc) setLocationIdState(loc);
    const fav = window.localStorage.getItem(KEY_FAV);
    if (fav) {
      try {
        const parsed = JSON.parse(fav);
        if (Array.isArray(parsed)) setFavorites(parsed as string[]);
      } catch {
        /* ignore corrupt value */
      }
    }
  }, []);

  const setLocationId = useCallback((id: string) => {
    setLocationIdState(id);
    window.localStorage.setItem(KEY_LOC, id);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      window.localStorage.setItem(KEY_FAV, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <LocationContext.Provider value={{ locationId, favorites, setLocationId, toggleFavorite }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationState() {
  return useContext(LocationContext);
}

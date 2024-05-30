import { Period, TimeFrame } from "@/types";
import { create } from "zustand";

interface HistoryStore {
  period: Period;
  setPeriod: (period: Period) => void;
  timeFrame: TimeFrame;
  setTimeFrame: (timeFrame: TimeFrame) => void;
  reset: () => void;
}

const defaultPeriod = {
  month: new Date().getMonth(),
  year: new Date().getFullYear(),
};

const useHistory = create<HistoryStore>((set) => ({
  period: defaultPeriod,
  timeFrame: "month",
  setPeriod: (period) => set({ period }),
  setTimeFrame: (timeFrame) => set({ timeFrame }),
  reset: () =>
    set({
      period: defaultPeriod,
      timeFrame: "month",
    }),
}));

export default useHistory;

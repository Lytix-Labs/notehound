import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import dayjs, { Dayjs } from "dayjs";

export interface GlobalTimeSelected {
  startTime: Dayjs;
  endTime: Dayjs | "now";
  refreshData: number;
}
export const counterSlice = createSlice({
  name: "globalTime",
  initialState: {
    startTime: dayjs().subtract(7, "days"),
    endTime: "now",
    refreshData: 0,
  } as GlobalTimeSelected,
  reducers: {
    setEndTime: (
      state,
      action: PayloadAction<{
        endTime: Dayjs | "now";
      }>
    ) => {
      state.endTime = action.payload.endTime;
    },
    setStartTime: (
      state,
      action: PayloadAction<{
        startTime: Dayjs;
      }>
    ) => {
      state.startTime = action.payload.startTime;
    },
    setTimeRange: (
      state,
      action: PayloadAction<{
        startTime: Dayjs;
        endTime: Dayjs | "now";
      }>
    ) => {
      state.startTime = action.payload.startTime;
      state.endTime = action.payload.endTime;
    },
    setRefreshNumber: (
      state,
      action: PayloadAction<{
        refreshData: number;
      }>
    ) => {
      state.refreshData = action.payload.refreshData;
    },
  },
  selectors: {},
});

export const { setEndTime, setStartTime, setTimeRange, setRefreshNumber } =
  counterSlice.actions;

export default counterSlice.reducer;

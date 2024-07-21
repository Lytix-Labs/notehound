import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface MeetingSummary {
  recordingData:
    | undefined
    | { id: string; name: string; date: Date; processing: boolean }[];
}
export const counterSlice = createSlice({
  name: "meetingSummary",
  initialState: {
    recordingData: undefined,
  } as MeetingSummary,
  reducers: {
    setRecordingData: (
      state,
      action: PayloadAction<{
        recordingData:
          | undefined
          | { id: string; name: string; date: Date; processing: boolean }[];
      }>
    ) => {
      console.log(`>>BEING PASSED`, action.payload.recordingData);
      state.recordingData = action.payload.recordingData;
      console.log(`>>state`, state.recordingData);
    },
  },
  selectors: {},
});

export const { setRecordingData } = counterSlice.actions;

export default counterSlice.reducer;

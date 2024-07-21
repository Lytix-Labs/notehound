import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface MeetingSummary {
  recordingData:
    | undefined
    | { id: string; name: string; date: Date; processing: boolean }[];
  searchResults:
    | undefined
    | {
        summaries: { meetingId: string; text: string }[];
        transcripts: { meetingId: string; text: string }[];
      };
}
export const counterSlice = createSlice({
  name: "meetingSummary",
  initialState: {
    recordingData: undefined,
    searchResults: undefined,
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
      state.recordingData = action.payload.recordingData;
    },
    setSearchResults: (
      state,
      action: PayloadAction<{ searchResults: MeetingSummary["searchResults"] }>
    ) => {
      state.searchResults = action.payload.searchResults;
    },
  },
  selectors: {},
});

export const { setRecordingData, setSearchResults } = counterSlice.actions;

export default counterSlice.reducer;

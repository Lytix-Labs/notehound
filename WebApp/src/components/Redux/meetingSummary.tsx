import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface MeetingSummary {
  recordingData:
    | undefined
    | {
        id: string;
        name: string;
        date: Date;
        processing: boolean;
        duration: number;
      }[];
  searchResults:
    | undefined
    | {
        summaries: { meetingId: string; text: string }[];
        transcripts: { meetingId: string; text: string }[];
      };
  meetingData: any;
}
export const counterSlice = createSlice({
  name: "meetingSummary",
  initialState: {
    recordingData: undefined,
    searchResults: undefined,
    meetingData: undefined,
  } as MeetingSummary,
  reducers: {
    setRecordingData: (
      state,
      action: PayloadAction<{
        recordingData:
          | undefined
          | {
              id: string;
              name: string;
              date: Date;
              processing: boolean;
              duration: number;
            }[];
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
    setMeetingData: (
      state,
      action: PayloadAction<{ meetingData: MeetingSummary["meetingData"] }>
    ) => {
      state.meetingData = action.payload.meetingData;
    },
  },
  selectors: {},
});

export const { setRecordingData, setSearchResults, setMeetingData } =
  counterSlice.actions;

export default counterSlice.reducer;

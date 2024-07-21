import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import globalTimeReducer from "./globalTimeReducer";
import meetingSummaryReducer from "./meetingSummary";

const appReducer = combineReducers({
  globalTime: globalTimeReducer,
  meetingSummary: meetingSummaryReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "USER_LOGOUT") {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export type RootState = ReturnType<typeof rootReducer>;

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
export default store;

/**
 * App dispatch
 */
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();

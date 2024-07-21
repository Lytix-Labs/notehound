import { MeetingSummary } from "@/components/Redux/meetingSummary";
import { Card } from "@/components/ui/card";
import { useSelector } from "react-redux";

const SearchResults = ({ searchQuery }: { searchQuery: string }) => {
  const searchResults = useSelector(
    (state: MeetingSummary) => state.searchResults
  );
  return (
    <div className="w-full">
      <Card>
        {searchQuery.length <= 3 ? (
          <div className="p-3">
            <p className="text-sm text-muted-foreground text-center">
              Please enter at least 3 characters to search
            </p>
          </div>
        ) : (
          <div>{JSON.stringify(searchResults)}</div>
        )}
      </Card>
    </div>
  );
};

export default SearchResults;

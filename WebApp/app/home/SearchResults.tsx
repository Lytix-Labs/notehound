import Loading from "@/components/Loading";
import { RootState } from "@/components/Redux/store";
import { Card } from "@/components/ui/card";
import { useSelector } from "react-redux";

const SearchResults = ({ searchQuery }: { searchQuery: string }) => {
  const searchResults = useSelector(
    (state: RootState) => state.meetingSummary.searchResults
  );
  console.log(searchResults);
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
          <>
            {searchResults === undefined ? (
              <div className="items-center justify-center py-5">
                <Loading />
              </div>
            ) : (
              <div>
                {searchResults["summaries"].length === 0 &&
                searchResults["transcripts"].length === 0 ? (
                  <div className="items-center justify-center py-5">
                    <p className="text-sm text-muted-foreground text-center">
                      No results found
                    </p>
                  </div>
                ) : (
                  <div>{JSON.stringify(searchResults)}</div>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default SearchResults;

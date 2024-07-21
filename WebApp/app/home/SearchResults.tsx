import Loading from "@/components/Loading";
import { RootState } from "@/components/Redux/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const SearchResults = ({ searchQuery }: { searchQuery: string }) => {
  const searchResults = useSelector(
    (state: RootState) => state.meetingSummary.searchResults
  );
  console.log(searchResults);
  const router = useRouter();
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
                  <div>
                    <p className="font-semibold">Transcripts</p>
                    {searchResults["transcripts"].map((transcript) => (
                      <Button
                        key={transcript["meetingId"] + transcript["text"]}
                        onClick={() =>
                          router.push(
                            `/summary-info/${transcript["meetingId"]}`
                          )
                        }
                        variant={"secondary"}
                      >
                        <p className="p-1">- {transcript["text"]}</p>
                      </Button>
                    ))}

                    <p>Summaries</p>
                    {searchResults["transcripts"].map((transcript) => (
                      <div
                        key={transcript["meetingId"] + transcript["text"]}
                        onClick={() =>
                          router.push(
                            `/summary-info/${transcript["meetingId"]}`
                          )
                        }
                      >
                        <p className="p-1">- {transcript["text"]}</p>
                      </div>
                    ))}
                  </div>
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

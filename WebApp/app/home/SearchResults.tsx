import Loading from "@/components/Loading";
import { RootState } from "@/components/Redux/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
                  <div className="flex flex-col px-3">
                    <p className="font-semibold ml-2 text-2xl">Transcripts</p>
                    <Separator className="my-2" />
                    {searchResults["transcripts"].map((transcript) => (
                      <Button
                        key={transcript["meetingId"] + transcript["text"]}
                        onClick={() =>
                          router.push(
                            `/summary-info/${transcript["meetingId"]}`
                          )
                        }
                        variant={"default"}
                        className="my-1 text-wrap h-full"
                      >
                        <p className="p-1">- {transcript["text"]}</p>
                      </Button>
                    ))}

                    <p className="font-semibold ml-2 text-2xl">Summaries</p>
                    <Separator className="my-2" />
                    {searchResults["summaries"].map((transcript) => (
                      <Button
                        key={transcript["meetingId"] + transcript["text"]}
                        onClick={() =>
                          router.push(
                            `/summary-info/${transcript["meetingId"]}`
                          )
                        }
                        variant={"default"}
                        className="my-1 text-wrap h-full"
                      >
                        <p className="p-1">- {transcript["text"]}</p>
                      </Button>
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

import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const NoDataComponent: React.FC<{ title: string; subHeader?: string }> = ({
  title,
  subHeader,
}) => {
  return (
    <Card className="flex flex-col items-center justify-center py-10">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        {subHeader && <CardDescription>{subHeader}</CardDescription>}
      </CardHeader>
      <div className="mt-5 text-sm text-muted-foreground">
        No data available. Try adjusting date range.
      </div>
    </Card>
  );
};
export default NoDataComponent;

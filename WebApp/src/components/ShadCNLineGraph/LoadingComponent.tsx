import Loading from "../Loading";
import { Card } from "../ui/card";

const LoadingComponent: React.FC<{ title: string; subHeader?: string }> = ({
  title,
  subHeader,
}) => {
  return (
    <Card className="flex items-center justify-center py-10">
      <Loading />
    </Card>
  );
};

export default LoadingComponent;

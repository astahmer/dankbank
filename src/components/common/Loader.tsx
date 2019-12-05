import { Spinner } from "@chakra-ui/core";
import { SpinnerProps } from "@chakra-ui/core/dist/Spinner";

import { useLoading } from "@/hooks/async/useLoading";

export type LoaderProps = SpinnerProps & {
    isLoading: boolean;
};

export function Loader({ isLoading, ...props }: LoaderProps) {
    const isDisplayed = useLoading(isLoading);
    return isDisplayed && <Spinner {...props} />;
}

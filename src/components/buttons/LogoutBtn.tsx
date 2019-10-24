import { Button } from "@chakra-ui/core";
import { useContext } from "react";

import { AuthContext } from "@/functions/hooks/useAuth";

export function LogoutBtn() {
    const auth = useContext(AuthContext);
    //  const toast = useToast();

    const onClick = () => {
        //   toast({
        //       title: "Logged out",
        //       status: "info",
        //       duration: 1500,
        //   });
        auth.actions.logout();
    };

    return <Button onClick={onClick}>Logout</Button>;
}

import { useContext } from "react";

import { LogoutBtn } from "@/components/buttons/LogoutBtn";
import { Debug } from "@/components/common/Debug";
import { baseURL } from "@/config/api";
import { useInitialAPI } from "@/hooks/async/useAPI";
import { AuthContext } from "@/hooks/async/useAuth";
import { AuthAccess } from "@/services/AuthManager";
import { IUser } from "@/types/entities/User";

export default function Profile() {
    const auth = useContext(AuthContext);
    const [async] = useInitialAPI<ItemResponse<IUser>>(baseURL + "/users/" + auth.user?.id);

    return (
        <div>
            <h1>Profile page</h1>
            <div>Logged in as :</div>
            <Debug data={async.data} />
            <div>
                <LogoutBtn />
            </div>
        </div>
    );
}

Profile.AuthAccess = AuthAccess.LOGGED;

Profile.PageHead = {
    title: "Profile",
    description: "Dankbank User profile ",
    keywords: "dankbank dank bank index home memes meme 420 69 user",
};

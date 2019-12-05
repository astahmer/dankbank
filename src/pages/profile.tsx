import { LogoutBtn } from "@/components/buttons/LogoutBtn";
import { AuthAccess } from "@/services/AuthManager";

export default function Profile() {
    return (
        <div>
            <h1>Profile page</h1>
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

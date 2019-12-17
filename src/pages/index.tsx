import { PageProps } from "@/components/layout/Page/PageLayout";
import { API } from "@/services/ApiManager";
import { AuthAccess } from "@/services/AuthManager";
import { IUser } from "@/types/entities/User";

import { UserLink } from "../components/modules/user/link";

type HomeUser = PartialEntity<IUser, "name">;
type HomeProps = { usersResponse: CollectionResponse<HomeUser> } & PageProps;

const Home = ({ usersResponse }: HomeProps) => (
    <>
        <h1>Home</h1>
        {usersResponse && (
            <>
                <ul>
                    {usersResponse.items.map((user) => (
                        <UserLink key={user.id} {...user} />
                    ))}
                </ul>
                <div>{usersResponse.items.length} users fetched</div>
            </>
        )}
    </>
);

Home.AuthAccess = AuthAccess.LOGGED;
Home.PageHead = {
    title: "Dankbank",
    description: "Dankbank home",
    keywords: "dankbank dank bank index home memes meme 420 69",
};

Home.getInitialProps = async () => {
    let usersResponse;
    try {
        usersResponse = await API.get<HomeUser[]>("/users?take=10");
    } catch (error) {
        console.log(error.message);
    }

    return { usersResponse };
};

export default Home;

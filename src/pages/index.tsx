import { NextPage } from "next";

import Layout from "../components/layout/Layout";
import { API } from "../config/api";
import { CollectionResponse, PartialEntity } from "../globalTypes";
import { UserLink } from "../components/modules/user/link";
import { IUser } from "../entities/User";

type HomeUser = PartialEntity<IUser, "name">;
type HomeProps = { usersResponse: CollectionResponse<HomeUser> };

const Home: NextPage<HomeProps> = ({ usersResponse }) => (
    <div>
        <Layout>
            <h1>Hello world!</h1>
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
        </Layout>
    </div>
);

Home.getInitialProps = async () => {
    let userResult;
    try {
        userResult = await API.get<HomeUser[]>("/users?take=10");
    } catch (error) {
        console.log(error);
    }

    return { usersResponse: userResult && userResult.data };
};

export default Home;

// https://auth0.com/blog/next-js-practical-introduction-for-react-developers-part-1/
// https://nextjs.org/learn/excel/typescript/home-page
// https://nextjs.org/learn/basics/getting-started/setup
// https://chakra-ui.com/
// http://dankbank.lol/

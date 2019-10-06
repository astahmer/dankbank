import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";

export default function Post() {
    const router = useRouter();

    return (
        <Layout>
            <h1>{router.query.name}</h1>
            <p>This is the blog post content.</p>
        </Layout>
    );
}

import Link from "next/link";
import { IUser } from "../../../entities/User";

export const UserLink = (props: Partial<IUser>) => (
    <li>
        <Link href="/u/[name]" as={`/u/${props.name}`}>
            <a>{props.name}</a>
        </Link>
    </li>
);

import { Box } from "@chakra-ui/core";
import Link from "next/link";

import { ILinkItem } from "./Page/PageLayout";

export type IHeaderLinkItem = Required<ILinkItem>;

export function Header({ links }: { links: IHeaderLinkItem[] }) {
    return (
        <header>
            {links.map((item) => (
                <Link href={item.route} key={item.name}>
                    <Box as="a" mr={15}>
                        {item.name}
                    </Box>
                </Link>
            ))}
        </header>
    );
}

import { Box } from "@chakra-ui/core";

import { MemeForm } from "@/forms/MemeForm";
import { AuthAccess } from "@/services/AuthManager";

export default function Add() {
    // TOOD onSuccess => redirect to details page ?
    return (
        <Box p={4}>
            <h1>Add page</h1>
            <MemeForm />
        </Box>
    );
}

Add.AuthAccess = AuthAccess.BOTH;

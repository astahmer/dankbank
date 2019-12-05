import { MemeForm } from "@/forms/MemeForm";
import { AuthAccess } from "@/services/AuthManager";

export default function Add() {
    return (
        <div>
            <h1>Add page</h1>
            <MemeForm />
        </div>
    );
}

Add.AuthAccess = AuthAccess.BOTH;

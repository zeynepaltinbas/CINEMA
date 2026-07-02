export function getFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
    const message = error instanceof Error
        ? error.message
        : typeof error === "string"
            ? error
            : fallback
    const normalizedMessage = message.toLowerCase()

    if (normalizedMessage.includes("invalid login credentials")) {
        return "The email or password is incorrect."
    }

    if (normalizedMessage.includes("email not confirmed")) {
        return "Please confirm your email before signing in."
    }

    if (normalizedMessage.includes("user already registered") || normalizedMessage.includes("already registered")) {
        return "An account with this email already exists."
    }

    if (normalizedMessage.includes("password should be") || normalizedMessage.includes("weak password")) {
        return "Please choose a stronger password."
    }

    if (normalizedMessage.includes("invalid email")) {
        return "Please enter a valid email address."
    }

    if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("violates row-level security")) {
        return "You do not have permission to save this yet. Please sign in again and try once more."
    }

    if (normalizedMessage.includes("foreign key constraint")) {
        return "Your account setup is still syncing. Please sign out, sign back in, and try again."
    }

    if (normalizedMessage.includes("duplicate key")) {
        return "This already exists."
    }

    if (normalizedMessage.includes("network") || normalizedMessage.includes("fetch failed")) {
        return "Network problem. Please check your connection and try again."
    }

    return fallback
}
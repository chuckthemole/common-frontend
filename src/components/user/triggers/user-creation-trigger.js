import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Spinner } from "../../ui";
import { useAuth } from "../../auth";
import { useCreateUser } from "../hooks/useCreateUser";
import UserCreationForm from "../forms/user-creation-form";
import ModalTrigger from "../../triggers/modal-trigger";
import { useRumpusModal } from "../../ui";
import logger from "../../../logger";
import { ConfirmModal } from "../../ui";

/**
 * UserCreationTrigger
 *
 * - Trigger button / link / text that opens user creation modal or redirects
 * - Uses RumpusModal + useRumpusModal in modal mode
 */
export default function UserCreationTrigger({
    mode = "modal",                 // "modal" | "redirect"
    triggerType = "button",         // "button" | "link" | "text"
    triggerLabel = "Add User",
    triggerClassName = "",
    redirectTo = "/",
    userCreationRoute = "",
    disabled = false,
    onOpen,
    onClose,
}) {

    /**
     * Navigation hook for redirecting the user.
     */
    const navigate = useNavigate();

    /**
     * Authentication hook for managing the user's authentication state.
     */
    const {
        isLoading: isAuthLoading,
        isAuthenticated,
        refreshAuth,
    } = useAuth();

    const [confirmData, setConfirmData] = useState({
        username: null,
        email: null,
    });

    /**
     * Modal ID for the signup trigger.
     */
    const userCreationModalId = "user-creation-trigger-modal";

    /**
     * Modal ID for the alert modal.
     */
    const userCreationAlertModalId = "user-creation-alert-modal";

    /**
     * Rumpus modal hook for managing the modal state.
     */
    const { openModal, closeModal } = useRumpusModal();

    /**
     * Reset input for the form.
     */
    const [resetInput, setResetInput] = useState(0);

    /**
     * User creation hook for handling the user creation process.
     */
    const {
        createUser,
        loading: userCreationLoading,
        error: userCreationError,
        resetError: resetUserCreationError,
    } = useCreateUser();

    /**
     * Handle the click event on the trigger.
     */
    const handleTriggerClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        navigate(userCreationRoute);
    };

    /**
     * Handle the close event.
     */
    const handleUserCreationModalClose = () => {
        setResetInput(prev => prev + 1);
        resetUserCreationError();
        onClose?.();
    };

    /**
     * Handle the submit event for the form.
     */
    const handleSubmit = async (data) => {
        try {
            const result = await createUser(data);

            if (!result.success) {
                logger.error("[UserCreationTrigger] Failed to create user");
                return false;
            }

            logger.info("[UserCreationTrigger] User created successfully");

            setConfirmData({
                username: data.username,
                email: data.email,
            });

            closeModal(userCreationModalId);
            openModal(userCreationAlertModalId);

            return true;
        } catch (err) {
            logger.error("[UserCreationTrigger] Exception creating user", err);
            return false;
        }
    };

    if (isAuthLoading || isAuthenticated === undefined) {
        return <Spinner size="20px" thickness="2px" color="#333" />;
    }

    if (!isAuthenticated) return null;

    const returnComponent = () => {
        if (mode === "modal") {
            return (
                <>
                    <ModalTrigger
                        modalId={userCreationModalId}
                        title="Add User"
                        triggerType={triggerType}
                        triggerLabel={triggerLabel}
                        triggerClassName={triggerClassName}
                        disabled={disabled}
                        onOpen={onOpen}
                        onClose={handleUserCreationModalClose}
                    >
                        <UserCreationForm
                            loading={userCreationLoading}
                            error={userCreationError}
                            oauthProviders={[]}
                            onSubmit={handleSubmit}
                            resetKey={resetInput}
                        />
                    </ModalTrigger>
                    <ConfirmModal
                        modalId={userCreationAlertModalId}
                        title="User Created"
                        message={`User ${confirmData.username} (${confirmData.email}) created successfully.`}
                        variant="alert"
                    />
                </>
            );
        } else { // TODO: Implement the non-modal case, I have not tested it yet.
            return (
                <button
                    type="button"
                    className={triggerClassName || "button is-primary"}
                    disabled={disabled}
                    onClick={(e) => handleTriggerClick(e)}
                >
                    {triggerLabel}
                </button>
            );
        }
    };

    return (
        returnComponent()
    );
}

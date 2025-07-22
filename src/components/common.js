// Paths
export const API_ROOT = '/api';
export const ROOT = '/';

// Keywords
export const EMPTY = '';
export const USERNAME = 'username';
export const USER = 'user';
export const ID = 'id';
export const PASSWORD = 'password';
export const EMAIL = 'email';

// Crud
export const POST = 'POST';
export const GET = 'GET';

// * * * * * * * * * * *
// * * * Functions * * *
// * * * * * * * * * * * 

// Modals
export function ActivateModal(modal, button) {
    if (button !== undefined) {
        button.onclick = function () {
            AddActiveClipped(modal);
        }
    }
    RemoveActiveClippedOnClick(modal);
    CloseOnBackgroundClick('modal-background', 'modal');
}

// Activates modal without button
export function ActivateModalNoButton(modal) {
    AddActiveClipped(modal);
    RemoveActiveClippedOnClick(modal);
    CloseOnBackgroundClick('modal-background', 'modal');
}

/**
 * 
 * @param {string} logName
 * @param {string} time
 * @param {string} action
 * @param {string} userId
 * @param {string} username
 * @returns {LogItem}
 * 
 * Creates a request to add a log item to the database
 */
export function CreateLogItemRequest(logName, action, userId, username) {
    const log_item = {};
    log_item['logName'] = logName;
    log_item['time'] = new Date().toLocaleString();
    log_item['action'] = action;
    log_item['userId'] = userId;
    log_item['username'] = username;
    const log_action_request_options = {
        method: POST,
        // redirect: "follow",
        entity: log_item,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log_item)
    };
    return log_action_request_options;
}

function AddActiveClipped(modal) {
    modal.classList.add("is-active");
    modal.classList.add("is-clipped");
}
function RemoveActiveClipped(modal) {
    modal.classList.remove("is-active");
    modal.classList.remove("is-clipped");
}
function RemoveActiveClippedOnClick(modal) {
    if (modal.getElementsByClassName("modal-close")[0] !== undefined) {
        modal.getElementsByClassName("modal-close")[0].onclick = function () {
            RemoveActiveClipped(modal);
        }
    }
}
function CloseOnBackgroundClick(backgroundClass, modalClass) {
    // If click outside the modal, close modal
    window.onclick = function (event) {
        var backgrounds = document.getElementsByClassName(backgroundClass);
        Array.prototype.forEach.call(backgrounds, function (background) { // get all modal backgrounds
            if (event.target == background) {
                var modals = document.getElementsByClassName(modalClass);
                Array.prototype.forEach.call(modals, function (modal) { // remove is-active from all modals
                    RemoveActiveClipped(modal);
                });
            }
        });
    }
}

export function GetClientTimeZoneOffset() {
    const globalDate = new Date();
    let diffZone = globalDate.getTimezoneOffset();
    console.log("offset: " + diffZone);
}

export function ConvertEpochToDate(epochTime) {
    return new Date(parseInt(epochTime));
}
import React from 'react';
import Modal from 'react-modal';

// bind modal to app element https://reactcommunity.org/react-modal/accessibility/
Modal.setAppElement('#root');

/*
This is keeping track of modal activity. TODO: see if react-modal has a built in solution for this.
*/

export let is_modal_active; // keeps track if user has a modal open. only allow one at a time.

/**
 * @returns true if a modal is active
 */
export function isModalActive() {
    if(is_modal_active !== undefined) {
        return is_modal_active;
    }
    return false;
}

/**
 * set modal open to true
 */
export function setModalActive() {
    is_modal_active = true;
}

/**
 * set modal open to false
 */
export function setModalInactive() {
    is_modal_active = false;
}

export const modal_style = {
    overlay: {
        backgroundColor: 'rgba(93, 93, 93, .5)',
    },
    content: {
        // top: '50%',
        // left: '50%',
        // right: 'auto',
        // bottom: 'auto',
        // marginRight: '-50%',
        transform: 'translate(0%, 70%)',
    },
};
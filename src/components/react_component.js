const React = require('react');
import UserIcon from './user_icon';
import SignupModal from './modal/signup_modal';
import LoginModal from './modal/login_modal';
import LogoutButton from './ui/logout_button';
import Admin from './admin';
import AdminButton from './ui/admin_button';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
export default function ReactComponent({ component_name }) {

    if (component_name === 'SignupModal') {
        // TODO: this is where Signup is failing. Need to supply a create_user_path
        return (<SignupModal create_user_path={'/api/user'} />); // TODO:  This path should be provided, not hard coded.
    } else if (component_name === 'LoginModal') {
        return (<LoginModal />);
    } else if (component_name === 'Logout') {
        return (<LogoutButton redirectTo={'/'} />);
    } else if (component_name === 'UserIcon') {
        return (<UserIcon />);
    } else if (component_name === 'Admin') {
        return (<AdminButton />);
    } else {
        console.log('No component match found for ' + component_name);
    }
}
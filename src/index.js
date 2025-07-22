import React from 'react';

console.log('Common lib React version:', React.version);

export { default as Admin } from './components/admin';
export { default as AwsGetResource } from './components/aws_get_resource';
export { AwsProperties } from './components/aws_properties';
export { default as BasePath } from './components/base_path';
export { CommonRequests } from './components/common_requests';
export { default as CommonUseFetcher } from './components/common_useFetcher';
export { default as Dnd } from './components/dnd';
export { default as Dropdown } from './components/dropdown';
export { get_selected } from './components/dropdown';
export { default as ErrorPage } from './components/error_page';
export { default as Footer } from './components/footer';
export { default as Header } from './components/header';
export { default as Json } from './components/json';
export { default as Landing } from './components/landing';
export { default as Log } from './components/log';
export { default as LoginModal } from './components/modal/login_modal';
export { default as Logout } from './components/logout';
export { ModalManager } from './components/modal_manager';
export { default as ReactComponent } from './components/react_component';
export { default as RumpusQuill } from './components/rumpus_quill';
export { default as RumpusQuillForm } from './components/rumpus_quill_form';
export { default as Section } from './components/section';
export { default as SignupModal } from './components/modal/signup_modal';
export { UserCommon } from './components/user_common';
export { default as UserIcon } from './components/user_icon';
export { default as UserInfo } from './components/user_info';
export { AuthProvider, useAuth } from './components/auth_context';
export { default as AuthRoot } from './components/auth_root';

export { default as api } from './api';
export { createApiClient } from './api'
export { getApi } from './api'
export { setApi } from './api'

export * as Common from './components/common'
// export * as Client from './client'
export * as Utils from './components/utils'

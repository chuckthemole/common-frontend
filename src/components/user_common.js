/**
 * TODO: Am I using this? I don't think so. Maybe prune. - chuck
 */

import React, { useState } from 'react';

// export var user_common = {};
export const UserCommonContext = React.createContext({nothing: 'nothing'});

// export default function UserCommon({common_create_user_path, common_current_user_info_path}) {
//     <UserCommonContext.Provider value={
//         {
//             create_user_path: common_create_user_path,
//             current_user_info_path: common_current_user_info_path
//         }
//     } />
//     // user_common.create_user_path = common_create_user_path;
//     // user_common.current_user_info_path = common_current_user_info_path;
//     // const [user_common, setUserCommon] = useState({
//     //     create_user_path: common_create_user_path,
//     //     current_user_info_path: common_current_user_info_path
//     // });
//     // return (user_common);
// }
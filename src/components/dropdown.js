import { faAngleDown, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const React = require('react');

let current_selected_item;

export function get_selected() {
    return current_selected_item;
}

export default function Dropdown({title, dropdown_items, dropdown_divider_items}) {
    const is_active = 'is-active';
    const [active, setActive] = React.useState(false);
    const [selected_item, setSelectedItem] = React.useState(dropdown_items[0].title);

    // TODO: work on divider more, will do when needed. - chuck
    let divider = '';
    if(dropdown_divider_items !== undefined) {
        divider = <hr className="dropdown-divider" />;
    }

    function toggle() {
        active == true ? setActive(false) : setActive(true);
    }

    React.useEffect(() => {
        current_selected_item = selected_item;
    }, [selected_item]);


    return(
        <>
            <div className='title is-4 is-spaced columns'>{title}</div>
            <div className={`columns dropdown ${active && is_active}`}>
                <div onClick={toggle} className="dropdown-trigger">
                    <button className="button" aria-haspopup="true" aria-controls="dropdown-menu">
                    <span>{selected_item}</span>
                    <span className="icon is-small">
                        <FontAwesomeIcon icon={faAngleDown} />
                        {/* <i className="fas fa-angle-down" aria-hidden="true"></i> */}
                    </span>
                    </button>
                </div>
                <div onClick={toggle} className="dropdown-menu" id="dropdown-menu" role="menu">

                    <div className="dropdown-content">
                        {dropdown_items.map(({title, link}) => (
                            <a key={title} className="dropdown-item" onClick={() => {setSelectedItem(title)}}>
                                {title}
                            </a>
                        ))}
                    </div>

                    {divider}

                </div>
            </div>
        </>
    )
}
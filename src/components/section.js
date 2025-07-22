import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { common_fetcher } from './common_requests';

export default function Section({section_path}) {

    const [htmlContent, setHtmlContent] = useState('');
    const { data, error } = useSWR( // TODO: use common_loader
        section_path,
        common_fetcher
    );
    
    useEffect(() => {
        if(data !== undefined && data !== null && data !== '') {
            console.log('Creating html content...');
            console.log(data);
            const htmlContent = constructHtmlContent(data);
            console.log(htmlContent);
            setHtmlContent(htmlContent);
        }
    }, [data]);

    if (error) {
        console.log(error);
        return(
            <div className='columns is-centered has-text-centered'>
                <div className='column is-half notification is-warning'>
                    <p>An error occurred getting section with path: {section_path}</p>
                </div>
            </div>
        )
    }

    if (!data) return(
        <div className='container m-6'>
            <progress className="progress is-small is-primary" max="100">15%</progress>
            <progress className="progress is-danger" max="100">30%</progress>
            <progress className="progress is-medium is-dark" max="100">45%</progress>
            <progress className="progress is-large is-info" max="100">60%</progress>
        </div>
    )

    // TODO: data.resources think about what to do...

    // recursive function to construct the html content from parent object
    function constructHtmlContent(currentObject) {
        if(currentObject !== undefined && currentObject !== null && currentObject !== '') {
            // iterate over currentObject.htmlAttributes object and add each attribute to the html tag
            let htmlTag = '';
            let htmlTagAttributes = '';
            if(currentObject.htmlAttributes !== undefined && currentObject.htmlAttributes !== null && currentObject.htmlAttributes !== '') {
                currentObject.htmlAttributes.map(attribute => {
                    htmlTagAttributes += `${attribute.propertyName}="${attribute.valueAsString}" `;
                });
            }

            // construct the html tag with the attributes and currentObject.htmlTagTypeValue
            htmlTag = `<${currentObject.htmlTagTypeValue} ${htmlTagAttributes}>${currentObject.body}`;

            // if currentObject.children is not undefined or null, then recursively call constructHtmlContent on each child
            if(currentObject.children !== undefined && currentObject.children !== null) {
                return `${htmlTag}${currentObject.children.map(child => {return constructHtmlContent(child)}).join('')}</${currentObject.htmlTagTypeValue}>`;
            }
            // if currentObject.children is undefined or null, then just return the html tag
            return `${htmlTag}</${currentObject.htmlTagTypeValue}>`;
        }
    }
    
    return (
        <>
            <div className='html-insert' dangerouslySetInnerHTML={{__html: htmlContent}}></div>
        </>
    )
}
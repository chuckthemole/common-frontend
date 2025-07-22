import React, { useEffect, useState } from 'react';
const aws = require('aws-sdk');
import useSWR from 'swr';
import { common_fetcher } from './common_requests';
import { getAwsProperties } from './aws_properties';

/**
 * TODO: this says get resource but is returning an image tag specifically. 
 */
export default function AwsGetResource({resource_key, aws_properties_path}) {

    const properties_call = getAwsProperties(aws_properties_path);
    const [aws_properties, setAwsProperties] = useState(undefined);
    const [resource_path, setResourcePath] = useState(undefined);

    useEffect(() => {
        if(properties_call.properties_data !== undefined) {
            setAwsProperties(properties_call.properties_data);
        }
    }, [properties_call]);

    if(aws_properties !== undefined) {
        aws.config.setPromisesDependency();
        aws.config.update({
            accessKeyId: aws_properties.accessKey,
            secretAccessKey: aws_properties.secretAccessKey,
            region: aws_properties.region
        });

        const s3 = new aws.S3();
        var params = {Bucket: aws_properties.bucketName, Key: resource_key};
        var promise = s3.getSignedUrlPromise('getObject', params);
        promise.then(url => {
            setResourcePath(url);
        });
    }

    // TODO: This has the secret access key visible in the browser. This is a security risk.
    return (<img src={resource_path} width="112" height="28"/>); // dimensions are hardcoded? should look into this
}
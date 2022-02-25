// MIT License
//
// Copyright (c) 2021-2022 Nobuo Kato (katonobu4649@gmail.com)
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React, {useCallback, useEffect} from 'react'
import { AWS, AWSIoT } from 'use-react-awsiot'
import awsConfiguration from  './aws-configuration'

const awsIotMqtt = () => {
    //
    // Remember our current subscription topic here.
    //
    const currentlySubscribedTopic = 'sdk/test/Python';

    //
    // Create a client id to use when connecting to AWS IoT.
    //
    const clientId = 'mqtt-explorer-' + (Math.floor((Math.random() * 100000) + 1));

    //
    // Initialize our configuration.
    //
    AWS.config.region = awsConfiguration.region;

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsConfiguration.poolId
    });

    //
    // Create the AWS IoT device object.  Note that the credentials must be 
    // initialized with empty strings; when we successfully authenticate to
    // the Cognito Identity Pool, the credentials will be dynamically updated.
    //
    const mqttClient = AWSIoT.device({
        //
        // Set the AWS region we will operate in.
        //
        region: AWS.config.region,
        host:awsConfiguration.host,
        //
        // Use the clientId created earlier.
        //
        clientId: clientId,
        //
        // Connect via secure WebSocket
        //
        protocol: 'wss',
        //
        // Set the maximum reconnect time to 8 seconds; this is a browser application
        // so we don't want to leave the user waiting too long for reconnection after
        // re-connecting to the network/re-opening their laptop/etc...
        //
        maximumReconnectTimeMs: 8000,
        //
        // Enable console debugging information (optional)
        //
        debug: true,
        //
        // IMPORTANT: the AWS access key ID, secret key, and sesion token must be 
        // initialized with empty strings.
        //
        accessKeyId: '',
        secretKey: '',
        sessionToken: ''
    });

    //
    // Attempt to authenticate to the Cognito Identity Pool.  Note that this
    // example only supports use of a pool which allows unauthenticated 
    // identities.
    //
    var cognitoIdentity = new AWS.CognitoIdentity();
    AWS.config.credentials.get(function(err, data) {
    if (!err) {
        console.log('retrieved identity: ' + AWS.config.credentials.identityId);
        var params = {
            IdentityId: AWS.config.credentials.identityId
        };
        cognitoIdentity.getCredentialsForIdentity(params, function(err, data) {
            if (!err) {
                //
                // Update our latest AWS credentials; the MQTT client will use these
                // during its next reconnect attempt.
                //
                mqttClient.updateWebSocketCredentials(data.Credentials.AccessKeyId,
                data.Credentials.SecretKey,
                data.Credentials.SessionToken);
            } else {
                console.log('error retrieving credentials: ' + err);
                alert('error retrieving credentials: ' + err);
            }
        });
    } else {
        console.log('error retrieving identity:' + err);
        alert('error retrieving identity: ' + err);
    }
    });

    return {mqttClient, currentlySubscribedTopic};

};

const {mqttClient:mqttClientInstance, currentlySubscribedTopic} = awsIotMqtt();


const MqttClient = ({termOut}) => {
    const onConnect = useCallback(()=>{
        termOut("Connected");
        mqttClientInstance.subscribe(currentlySubscribedTopic);
    },[termOut]);
    const onReconnect = useCallback(()=>{
        termOut("Reonnected");
    },[termOut]);
    const onMessage = useCallback((topic, payload)=>{
        termOut('message: ' + topic + ':' + payload.toString());
    },[termOut])
    useEffect(()=>{
        mqttClientInstance.on('connect', onConnect);
        mqttClientInstance.on('reconnect', onReconnect);
        mqttClientInstance.on('message', onMessage);
        return ()=>{
            mqttClientInstance.off('connect', onConnect);
            mqttClientInstance.off('reconnect', onReconnect);
            mqttClientInstance.off('message', onMessage);
        }
    },[onConnect, onReconnect, onMessage]);
    return (null);
}

export default MqttClient;

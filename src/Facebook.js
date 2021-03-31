import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';

// Facebook docs referencing this flow https://developers.facebook.com/docs/marketing-api/business-manager/guides/on-behalf-of
// App scopes are requested in the FacebookLogin component props

const Facebook = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [tokenInfo, setTokenInfo] = useState([]);
  const [clientBmSuToken, setClientBmSuToken] = useState('');
  const [sysUserId, setSysUserId] = useState('');
  const [pageToken, setPageToken] = useState([]);
  const [longLiveToken, setLongLiveToken] = useState('');

  const clientBmId = ''; // can be found in the Business Manager/Business Settings/Business Info
  const clientPageId = ''; // can be found in the Business Manager/Pages menu
  
  const partnerBmId = ''; // can be found in the Business Manager/Business Settings/Business Info
  const partnerBmAdminSuToken = ``; // this will be created through the processes below
  const appSecret = ''; // app secret can be found in the app Dashboard/Setting/Basic
  const redirectUri = ''; // this may be needed for future requests, set can be set in the App Dashboard/Products/Facebook Login/Settings/Valid OAuth Redirect URIs
  const appId = ''; // refered to as client id in Business Management API On Behalf of doc
  const appToken = ''; // this is only really needed for checking the token info so far
  // app token can be found here in when logged into your developer account https://developers.facebook.com/tools/accesstoken/

  // gets info on any tokens
  const getTokenInfo = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/debug_token?input_token=${userData.userToken}&access_token=${appToken}`,
      method: 'get',
    });
    setTokenInfo(response.data);
    console.log('token info', response);
  };

  // takes initial shortlived user token and converts it to a longlived token
  const getLongLiveToken = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${userData.userToken}`,
      method: 'get',
    });
    setLongLiveToken(response.data.access_token);
    console.log('Long Live Token', response.data);
  };

  // onclick function that came with FacebookLogin component
  const componentClicked = (response) => {
    console.log('response', response);
  };

  // Step 1, login user through facebook button,
  // this comes with react-facebook-login package
  // take facebook login response and set userData
  const responseFacebook = (response) => {
    if (response.status !== 'unknown') {
      console.log('response',response);
      setIsLoggedIn(true);
      setUserData({
        userName: response.name,
        userToken: response.accessToken,
        userId: response.id,
      });
    }
  };

  // Step 2, create the On Behalf Of Relationship between 
  // the partner (app creator) and client's Business Manager
  // this returns an id
  const createOnBehalfRelation = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/${partnerBmId}/managed_businesses?existing_client_business_id=${clientBmId}&access_token=${userData.userToken}`,
      method: 'post',
    });
    console.log('create On Behalf', response);
  };

  // Step 3, fetch access token of system user under the client's Business Manager
  // this is the system user that was created in the business/apps business manager
  const getClientSysUserBm = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/${clientBmId}/access_token?scope=pages_show_list,pages_read_engagement,pages_read_user_content&app_id=${appId}&access_token=${partnerBmAdminSuToken}`,
      method: 'post',
    });
    setClientBmSuToken(response.data.access_token)
    console.log('Client BM SU Token', response);
  };

  // Step 4, get the ID of the system user
  const getSysUserId = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/me?access_token=${clientBmSuToken}`,
      method: 'get',
    });
    setSysUserId(response.data.id);
    console.log('System User ID', response);
  };

  // Step 5, Assign assets (page) to the system user in the client's Business Manager
  const assignSuAssets = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/${clientPageId}/assigned_users?user=${sysUserId}&tasks=MANAGE&access_token=${userData.userToken}`,
      method: 'post',
    });
    console.log('Assign SU Assets', response);
  };

  // Step 6, Store the clientBmSuToken in a secure database and use it 
  // for accessing APIs that require a user access token

  // Step 7, Generate a Page Access Token using CLIENT_BM_SU_ACCESS_TOKEN (clientBmSuToken)
  // So far this step has been returning a successful response, the response has been empty though
  const getPageToken = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/me/accounts?access_token=${clientBmSuToken}`,
      method: 'get',
    });
    setPageToken(response.data);
    console.log('Page Token Res', response.data);
  };

  // These are all sample queries to get info with a token

  // graph api query to get the users name
  // const getName = async () => {
  //   const response = await axios({
  //     url: `https://graph.facebook.com/${userData.userId}?fields=name&access_token=${longLiveToken}`,
  //     method: 'get',
  //   });
  //   console.log('name query', response);
  // };

  // graph api query to get the users posts
  // const getPosts = async () => {
  //   const response = await axios({
  //     url: `https://graph.facebook.com/${userData.userId}/posts?access_token=${longLiveToken}`,
  //     method: 'get',
  //   });
  //   console.log('post query', response);
  // };

  // const getPageIds = async () => {
  //   const response = await axios({
  //     url: `https://graph.facebook.com/${userData.userId}/assigned_pages?access_token=${longLiveToken}`,
  //     method: 'get',
  //   });
  //   console.log('pages query', response);
  // };

  console.log('user data', userData);
  console.log('token info', tokenInfo);
  console.log('long live token', longLiveToken);
  console.log('client sys user id', sysUserId);
  console.log('client sys user token', clientBmSuToken);
  console.log('page token', pageToken);

  return(
    <div>
      Facebook Login
      <div>
        {isLoggedIn ? 
          <div>
            {userData.name}
            <br />
            <button onClick={() => getTokenInfo()}>Get Token info</button><br /><br />
            <button onClick={() => getLongLiveToken()}>Get Long Live Token</button><br /><br />
            <h2>Start of On Behalf of Flow</h2>
            <button onClick={() => createOnBehalfRelation()}>Create On Behalf Relationship</button><br /><br />
            <button onClick={() => getClientSysUserBm()}>Get Client BM SU Access Token</button><br /><br />
            <button onClick={() => getSysUserId()}>Get System User ID</button><br /><br />
            <button onClick={() => assignSuAssets()}>Assign System User Page</button><br /><br />
            <button onClick={() => getPageToken()}>Get Page Token</button><br /><br />
            {/* <h2>Sample Graph API Queries</h2> */}
            {/* <button onClick={() => getName()}>Get User Name</button><br /><br /> */}
            {/* <button onClick={() => getPosts()}>Get User Posts</button><br /><br /> */}
            {/* <button onClick={() => getPageIds()}>Get User Posts</button><br /><br /> */}
          </div>
          :
          <FacebookLogin 
            appId={appId}
            autoLoad={false}
            fields="name,email,picture"
            scope="business_management,read_insights,pages_show_list,pages_read_engagement,pages_read_user_content,public_profile"
            onClick={componentClicked}
            callback={responseFacebook}
          />
        }
      </div>
    </div>
  );
};

export default Facebook;
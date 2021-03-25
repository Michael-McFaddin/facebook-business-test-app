import React, { useState } from 'react';
import FacebookLogin from 'react-facebook-login';
import axios from 'axios';

const Facebook = () => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [clientBmSuToken, setClientBmSuToken] = useState('');
  const [sysUserId, setSysUserId] = useState('');
  const [pageToken, setPageToken] = useState([]);

  const clientBmId = '';
  const clientPageId = ''; 
  
  const partnerBmId = '';
  const partnerBmAdminSuToken = ``;
  // const clientSecret = ''; // app secret
  // const redirectUri = 'http%3A%2F%2Flocalhost%3A3000%2F'; // pre encoded
  const appId = ''; // client id
  const appToken = '';

  // onclick function that came with FacebookLogin component
  const componentClicked = (response) => {
    console.log('response', response);
  };

  // Facebook docs referencing this flow https://developers.facebook.com/docs/marketing-api/business-manager/guides/on-behalf-of

  // Step 1, login user through facebook button
  // take facebook login response and set resData
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

  // gets info on any tokens
  const getTokenInfo = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/debug_token?input_token=${userData.userToken}&access_token=${appToken}`,
      method: 'get',
    });
    console.log('token info', response);
  };

  // Step 2, create the On Behalf Of Relationship between 
  // the partner (app creator) and client's Business Manager
  const createOnBehalfRelation = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/${partnerBmId}/managed_businesses?existing_client_business_id=${clientBmId}&access_token=${userData.userToken}`,
      method: 'post',
    });
    console.log('create On Behalf', response);
  };

  // Step 3, fetch access token of system user under the client's Business Manager
  const getClientSysUserBm = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/${clientBmId}/access_token?scope=business_management,pages_show_list,pages_read_engagement,pages_read_user_content&app_id=${appId}&access_token=${partnerBmAdminSuToken}`,
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
  // for accessing APIs that require a user access token, such as Catalog Managemnt

  // Step 7, Generate a Page Access Token using CLIENT_BM_SU_ACCESS_TOKEN (clientBmSuToken)
  const getPageToken = async () => {
    const response = await axios({
      url: `https://graph.facebook.com/v10.0/me/accounts?access_token=${clientBmSuToken}`,
      method: 'get',
    });
    setPageToken(response.data);
    console.log('Page Token Res', response.data);
  };

  // graph api query to get the users name
  // const getName = async () => {
  //   const response = await axios({
  //     url: `https://graph.facebook.com/${resData.userId}?fields=name&access_token=${longLivedToken}`,
  //     method: 'get',
  //   });
  //   console.log('name query', response);
  // };

  // graph api query to get the users posts
  // const getPosts = async () => {
  //   const response = await axios({
  //     url: `https://graph.facebook.com/${resData.userId}/posts?access_token=${longLivedToken}`,
  //     method: 'get',
  //   });
  //   console.log('post query', response);
  // };

  // const getPageIds = async () => {
  //   const response = await axios({
  //     url: `https://graph.facebook.com/${userId}/assigned_pages?access_token=${longLivedToken}`,
  //     method: 'get',
  //   });
  //   console.log('pages query', response);
  // };

  console.log('user data', userData);
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
            <button onClick={() => createOnBehalfRelation()}>Create On Behalf Relationship</button><br /><br />
            <button onClick={() => getClientSysUserBm()}>Get Client BM SU Access Token</button><br /><br />
            <button onClick={() => getSysUserId()}>Get System User ID</button><br /><br />
            <button onClick={() => assignSuAssets()}>Assign System User Page</button><br /><br />
            <button onClick={() => getPageToken()}>Get Page Token</button><br /><br />
            {/* <button onClick={() => getName()}>Get User Name</button><br /><br /> */}
            {/* <button onClick={() => getPosts()}>Get User Posts</button><br /><br /> */}
            {/* <button onClick={() => getPageIds()}>Get User Posts</button><br /><br /> */}
          </div>
          :
          <FacebookLogin 
            appId={appId}
            autoLoad={false}
            fields="name,email,picture"
            scope="business_management,pages_show_list,pages_read_engagement,pages_read_user_content"
            onClick={componentClicked}
            callback={responseFacebook}
          />
        }
      </div>
    </div>
  );
};

export default Facebook;
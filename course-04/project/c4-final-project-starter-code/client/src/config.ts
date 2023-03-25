// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'jur3nfakl1'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-12puib0un0xelcvv.us.auth0.com',            // Auth0 domain
  clientId: 'IheIY5SUgA25HGm9JocaR6sW5K1p4o1l',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

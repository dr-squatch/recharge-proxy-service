# Recharge Proxy API
AWS Lambda functions to serve as Recharge Proxy API, together with corresponding API Gateway setup.

## Installation & Development
```bash
npm install   # install package 
sls offline   # testing locally using Serverless Offline
sls deploy --aws-profie=[profile alias] --stage=[stage name] --configure=[serverless config file of choice, per store] # deploying to AWS
```
- Create a profile for each stage (dev and prod) using AWS CLI and `~/.aws/credentials`
- Credentials are to be avaialble in AWS SSO console
- See https://chariotsolutions.com/blog/post/managing-aws-users-and-roles-in-a-multi-account-organization/

### Prerequisites
- Node.js12
- Serverless framework ([Documentation](https://www.serverless.com/framework/docs/)): Configuration details are found in `serverless.yml`
- Plugin: serverless-offline ([Documentation](https://www.npmjs.com/package/serverless-offline))
- Plugin: severless-custom-domain ([Documentation](https://www.npmjs.com/package/serverless-domain-manager))

### Environemental Variables
- API_KEY: a string of API key for authentication (of this service), coming in from request headers
- RECHARGE_API_URL: a string of Recharge API URL
- RECHARGE_API_KEY_COLLECTION: string of Recharge API keys, separated by ";"

## Usage
Current base URL:  https://recharge.[dev or prod].squatch-services.com

#### Customer
```
GET /customer
GET /customer/{id}/{resource}
PUT /customer/{id}
```
- Retrieve a customer: query parameter `email` required
- Retrieve a customer resource: possible values for path parameter {resource} are `addresses`, `subscriptions`, `payment_sources`. Retrieving `subscriptions` will return onetimes as well.
- Update a customer

#### Subscription
```
POST /subscription
PUT /subscription/{id}
POST /subscription/${id}/cancel
```
- Create a subscription
- Update a subscription
- Cancel a subscription

#### Onetime
```
POST /onetime
PUT /onetime/{id}
DELETE /onetime/{id}
```
- Add a onetime: query parameter `addressId` required
- Update a onetime
- Cancel a onetime

#### Address
```
POST /address
PUT /address/{id}
```
- Add an address: query parameter `customerId` required. It calls a Recharge endpoint `/customers/{customer_id}/addresses`
- Update an address: query parameter `apply_discount_id`, `remove_discount_id` optional. It calls a Recharge endpoint `/addresses/{id}/apply_discount` or
`/addresses/{id}/remove_discount` 

#### Charges
```
GET /charge
POST /charge/{id}?action={action}
```
- Get charges: see list of optional query parameters [here](https://developer.rechargepayments.com/?shell#list-charges)
- Update charge: required query paramterer `action`, which currently accepts only `apply_discount` or `remove_discount`; for more informaton, see [here](https://developer.rechargepayments.com/2021-11/charges/apply_discount)

For specifics on data, see Recharge API [documentation](https://developer.rechargepayments.com/?shell#introduction) See 

### Authenticaton
Via a header
```javascript
{ "X-Api-Key": "API key" }
```


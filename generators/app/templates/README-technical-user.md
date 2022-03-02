# Service Authentication with OAuth - Technical user flow

## Deploy the service

The service expects a JWT token from the application and validates it using Security API (@sap/xssec).
The token contains information about the caller.

The service logs some of these properties.
It also logs the additional authorization attributes passed by the calling application.
These attributes can contain arbitrary data.
```js
  console.log('Service instance id:', req.authInfo.getCloneServiceInstanceId());
  console.log('Caller tenant id:', req.authInfo.getIdentityZone());
  console.log('Token grant type:', req.authInfo.getGrantType());
  console.log('Calling app has name %s and id %s',
    req.authInfo.getAdditionalAuthAttribute('application_name'),
    req.authInfo.getAdditionalAuthAttribute('application_id')
  );
```
See [service/server.js](service/server.js).

### Install applications dependencies

```sh
cd service
npm install
cd ../broker
npm install
cd ..
```

### Perform the steps in the [prerequisites section](/examples/prerequisites.md)

```
npm i -g @sap/sbf
cd broker
gen-catalog-ids
cd ..
hash-broker-password
```

## or try the included script.
```
tools/finalize-setup.sh
```

Broker password to be hashed: 
Warning: For ISO/SOC compliance, the password should be at least 15 characters long.
Hashed credentials: [password]
sha256:cysd0RjF1dHqcJ5CDgZvddTD9DgJa78ov1hXlnCxKsQ=:lTETIvPe+ZYETjw5ELjk7a0uKjvc6oLOtwGlxhrXn/A=

```
Edit manifest.yml and replace [hashed-password] with the output of hash-broker-password
```

### Substitute placeholders to avoid collisions

In order to avoid collisions in naming, several placeholders in application files should be substituted with your own names. Open `manifest.yml` and substitute `[c/d/i-user]` with your user ID or other string that will not result in collisions with host names. Do the same for `xs-security.json`.
Change `<%= cf_domain %>` with the CF domain e.g. `cfapps.sap.hana.ondemand.com`.

### Create UAA service of plan broker

As a first step we create an UAA service instance of plan broker to bind to our service and service broker. The service name is provided to service and service broker applications via environment variables.

```sh
cf create-service xsuaa broker <%= app_name %>-uaa -c xs-security.json
```

### Create auditlog service of plan standard (from prerequisites.md)

```bash
cf create-service auditlog standard <%= app_name %>-audit
```

### Push service

```sh
cf push
```

### Register the service broker in Cloud Foundry

Before executing the next command you need to substitute the placeholders in it.
This command registers new service broker with space scope at the provided URL.

```sh
cf create-service-broker <%= app_name %>-service-broker-<%= suffix_name %> <%= broker_user_name %> [password] https://<%= app_name %>-service-broker-<%= suffix_name %>.<%= cf_domain %> --space-scoped
```
Here's an example of how a customer would register your service-broker in their org/space
```sh
cf t -o <%= excust_org_name %>
cf create-service-broker <%= app_name %>-service-broker-<%= suffix_name %>/<%= excust_org_name %> <%= broker_user_name %> [password] https://<%= app_name %>-service-broker-<%= suffix_name %>.<%= cf_domain %> --space-scoped
```
Verify that the service broker is registered and appearing in the marketplace
```sh
cf service-brokers
cf m | grep <%= app_name %>-service-<%= suffix_name %>
```
Now create a service instance of your custom service broker and bind it to an example consumer app
```sh
cd consumer
cf create-service <%= app_name %>-service-<%= suffix_name %> default <%= app_name %>-service-instance -c parameters.json
```

## Consume the newly created <%= app_name %> service

To demonstrate the usage of products service there is a small consumer application prepared in _consumer_ directory.

The application requests a JWT token from UAA using **client credentials** flow.
See [UAA API](https://docs.cloudfoundry.org/api/uaa) > _Token_ > _Client Credentials Grant_.
Then the application uses this token to call the service.
See [consumer/server.js](consumer/server.js).

The consuming application can add arbitrary data in the JWT token.
In this example the application adds `application_name` and `application_id` properties:
```js
  let additionalAttributes = {
    // here the application can pass arbitrary data to the service
    application_id: VCAP_APPLICATION.application_id,
    application_name: VCAP_APPLICATION.application_name
  };
  request.post(tokenURL, {
    form: {
      'client_id': clientId,
      'client_secret': clientSecret,
      'grant_type': 'client_credentials',
      'response_type': 'token',
      'authorities': JSON.stringify({ az_attr: additionalAttributes })
    }
```

Install application dependencies:
```sh
cd consumer
npm install
```

Open `consumer/manifest.yml` and substitute `[c/d/i-user]` with your user ID or other string that will not result in collisions with host names.

### Create service instance of type <%= app_name %>-service

```sh
cf create-service <%= app_name %>-service-<%= suffix_name %> default <%= app_name %>-service-instance -c parameters.json
```

### Deploy the consumer application

```sh
cf push
```

### Call the application

Get the consumer application URL using CF cli, like:

```sh
cf app <%= app_name %>-service-consumer
```

Get products by appending the `/products` to the URL and request it via browser for example.

Check the service logs
```sh
cf logs <%= app_name %>-service --recent
```
You should see the data extracted from the token, e.g.
```
2017-07-13T17:54:16.82+0300 [APP/PROC/WEB/0] OUT Service instance id: 167395a5-de69-422f-bfe0-1ea553ad7e30
2017-07-13T17:54:16.82+0300 [APP/PROC/WEB/0] OUT Caller tenant id: cc-sap
2017-07-13T17:54:16.82+0300 [APP/PROC/WEB/0] OUT Token grant type: client_credentials
2017-07-13T17:54:16.82+0300 [APP/PROC/WEB/0] OUT Calling app has name <%= app_name %>-service-consumer and id f407548d-0854-435b-8d26-d91a95ad4c64
```

## Cleanup

When you no longer need this example, you can delete its artifacts from Cloud Foundry:
```sh
cf delete -r -f <%= app_name %>-service-consumer
cf delete-service -f <%= app_name %>-service-instance
cf delete-service-broker -f <%= app_name %>-service-broker-<%= suffix_name %>
cf delete-service-broker -f <%= app_name %>-service-broker-<%= suffix_name %>/<%= excust_org_name %>
cf delete -r -f <%= app_name %>-service-broker
cf delete -r -f <%= app_name %>-service

cf delete-service -f <%= app_name %>-uaa
cf delete-service -f <%= app_name %>-audit
```

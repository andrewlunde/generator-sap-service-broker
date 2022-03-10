# <%= app_name %> service broker

Welcome to the <%= app_name %> service broker project.

## Description

This is an example of how to provide a Software As A Service(SaaS) offering in the form of a custom service broker(not a subscribable multitenant application).  Once registered in a Cloudfoundry organization and space, it will appear in the marketplace of that org/space just like any other service.  You may then create a service instance of it and bind it to your consuming application or create a service key for it to reveal the particular credentials and endpoints.


## Advantages

The key advantage to providing your solution in this way is to enable it to be consumed in a different Business Technology Platform(BTP) global account from which it resides.  This is currently not possible with the standard multitenant/subcription model as they are restricted to only be subscribable from subaccounts within the same global account.

Another advantage is that it allows your solution to be consumed in the same way that other system provided services are (ex: AuditLog Service).  


## Disadvantages

Since this approach doesn't rely on subaccounts, the endpoints are common for all consumers of the service and only the client_credentials grant_type is allowed.  You can't authenticate as a particular named user since there is no mechanism to provide an external identity provider(no trust relationships).  Nor can you use destinations or cloud connector features that a subaccount provides.

Your solution must also completely handle the provisioning and deprovisioning logic as required.  This includes setting up any required persistency(files, schemas, and/or database containers), tracking which are allocated to which tenant, and tearing them down or archiving them as your solution requires.


## Documentation

This template project was built using the SAP Service Broker Framework Node package [@sap/sbf](https://www.npmjs.com/package/@sap/sbf#xsuaa) and the XSUAA credential option.  See the documentation for details.


## Installation

The best approach is to use a yeoman template generator.  When you run the yeoman generator, you will be prompted to enter the details particular to your situation(don't just take the defaults) and avoid having to refactor it once it's generated.

```
npm install -g yo
npm install -g generator-sap-service-broker
```

Now that yeoman and the service broker generator is installed on your local system, run the generator with this command.

```
yo sap-service-broker
```

Follow the prompts and substitute your own values as needed.  This will help to create uniqueness and avoid naming collisions as mentioned above.


## Perform the following steps or if you have a bash shell available, run the finalize-setup script

```
npm i -g @sap/sbf
cd broker
gen-catalog-ids
cd ..
hash-broker-password
```

### or try the included script.
```
tools/finalize-setup.sh
```

You will be prompted to enter a password.  The hash-broker-password tool will take your provided password and create a sha256 hashed version of it.  You should see something like this.

```
Broker password to be hashed: 
Warning: For ISO/SOC compliance, the password should be at least 15 characters long.
Hashed credentials: [password]
sha256:cysd0RjF1dHqcJ5CDgZvddTD9DgJa78ov1hXlnCxKsQ=:lTETIvPe+ZYETjw5ELjk7a0uKjvc6oLOtwGlxhrXn/A=
```

Edit manifest.yml and replace [hashed-password] with the output of hash-broker-password.

You will need to use the password you provided in the create-service-broker command listed below (replacing [password]) in order to register your service broker.

### Manual steps

Since we are using the manifest method of deploying our service broker components, we need to set up the services it requires prior to pushing.

### Create UAA service of plan broker

As a first step we create an UAA service instance of plan broker to bind to our service and service broker. The service name is provided to service and service broker applications via environment variables.

```sh
cf create-service xsuaa broker <%= app_name %>-uaa -c xs-security.json
```

### Create auditlog service of plan standard (from prerequisites.md)

```bash
cf create-service auditlog standard <%= app_name %>-audit
```

Verify that the services were created correctly.
```
cf s
```

You should see this.
```
<%= app_name %>-uaa               xsuaa                broker     
<%= app_name %>-audit             auditlog             standard      
```

### Push service

This will create an application that handles the service broker proisioning callbacks(anonymous authentication) and another one that handles the service broker features(authentication required).

```sh
cf push
```

When this is completed check the deployed apps.
```
cf a
```

You should see the following apps.

```
name                       requested state   instances   ...
<%= app_name %>-service-broker    started           1/1         ...
<%= app_name %>-service           started           1/1         ...
```

### Register the service broker in Cloud Foundry

This command registers the new service broker with space scope at the provided URL.

```sh
cf create-service-broker <%= app_name %>-service-broker-<%= suffix_name %> <%= broker_user_name %> [password] https://<%= app_name %>-service-broker-<%= suffix_name %>.<%= cf_domain %> --space-scoped
```
Verify that the service broker is registered and appearing in the marketplace
```sh
cf service-brokers
cf m | grep <%= app_name %>-service-<%= suffix_name %>
```

### Monitoring the broker and underlying service

If you want to keep watch on the provisioning and deprovisioning events, watch the logs of the service and service-broker in separate terminal windows.

```
cf logs <%= app_name %>-service
cf logs <%= app_name %>-service-broker
```

### Deploying within the same global account but different org/space within the same landscape.


Now change into the consumer1 folder and create a service instance of your custom service broker and bind it to an example consumer app
```sh
cd consumer1
```

### Create service instance of type <%= app_name %>-service

```sh
cf create-service <%= app_name %>-service-<%= suffix_name %> default <%= app_name %>-service-instance1 -c parameters.json
```

### Keep checking on the status of the service instance creation until you get 'create succeeded'
```sh
cf service <%= app_name %>-service-instance1
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

[https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products](https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products)

You can add products to your service broker like this.

Add beer =[https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=beer](https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=beer) 

Add chips =[https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=chips](https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=chips) 

Check what's been added.

[https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products](https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products)

You can remove products as well with the del action.

Del(ete) chips =[https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products?action=del&product=chips](https://<%= app_name %>-service-consumer1-<%= suffix_name %>.<%= cf_domain %>/products?action=del&product=chips) 


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

### Deploying within a different global account and different org/space but within the same landscape.

Change to a different global account and potentially login as a different user.  A good way to do this is to utilize your trial account.  [https://cockpit.hanatrial.ondemand.com/trial/#/home/trial](https://cockpit.hanatrial.ondemand.com/trial/#/home/trial)

```
cf t -o <%= ex2_cust_org_name %> 
```

Now change into the consumer2 folder and create a service instance of your custom service broker and bind it to an example consumer app
```sh
cd ..
cd consumer2
```

### Register the service broker in the second org/space on the same landscape

This command registers the service broker additionally with space scope at the provided URL.  Make sure to use the password you provided above or the registration with fail.

```sh
cf create-service-broker <%= app_name %>-service-broker-<%= suffix_name %>/<%= ex2_cust_org_name %> <%= broker_user_name %> [password] https://<%= app_name %>-service-broker-<%= suffix_name %>.<%= cf_domain %> --space-scoped
```
Verify that the service broker is registered and appearing in the marketplace
```sh
cf service-brokers
cf m | grep <%= app_name %>-service-<%= suffix_name %>
```

### Create service instance of type <%= app_name %>-service

```sh
cf create-service <%= app_name %>-service-<%= suffix_name %> default <%= app_name %>-service-instance2 -c parameters.json
```

### Keep checking on the status of the service instance creation until you get 'create succeeded'
```sh
cf service <%= app_name %>-service-instance2
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

Again, get products by appending the `/products` to the URL and request it via browser for example.

[https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products](https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products)

Add wine = [https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=wine](https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=wine) 

Add cheese =[https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=cheese](https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products?action=add&product=cheese) 

Check what's been added.

[https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products](https://<%= app_name %>-service-consumer2-<%= suffix_name %>.<%= cf_domain %>/products)

## Cleanup

When you no longer need this example, you can delete its artifacts from Cloud Foundry:

Note:  Make sure to delete things in this order otherwise the service broker can get messed up and you won't be able to remove it.

```sh
cf t -o <%= ex2_cust_org_name %>
cf delete -r -f <%= app_name %>-service-consumer2
cf delete-service -f <%= app_name %>-service-instance2
cf delete-service-broker -f <%= app_name %>-service-broker-<%= suffix_name %>/<%= ex2_cust_org_name %>
cf t -o <%= ex1_cust_org_name %>
cf delete -r -f <%= app_name %>-service-consumer1
cf delete-service -f <%= app_name %>-service-instance1
cf delete-service-broker -f <%= app_name %>-service-broker-<%= suffix_name %>/<%= ex1_cust_org_name %>
cf delete-service-broker -f <%= app_name %>-service-broker-<%= suffix_name %>
cf delete -r -f <%= app_name %>-service-broker
cf delete -r -f <%= app_name %>-service
cf delete-service -f <%= app_name %>-uaa
cf delete-service -f <%= app_name %>-audit
```

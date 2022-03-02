$ cf update-service-broker products-demo-service-broker-tech broker [password] https://products-service-broker-tech.cfapps.us10.hana.ondemand.com
Updating service broker products-demo-service-broker-tech as andrew.lunde@sap.com...
OK
Warning: Service plans are missing from the broker's catalog (https://products-service-broker-tech.cfapps.us10.hana.ondemand.com/v2/catalog) but can not be removed from Cloud Foundry while instances exist. The plans have been deactivated to prevent users from attempting to provision new instances of these plans. The broker should continue to support bind, unbind, and delete for existing instances; if these operations fail contact your broker provider.

Service Offering: products-service-tech
Plans deactivated: default


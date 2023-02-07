# bitbucket_package_update_redoc

You can use the script by executing it in the terminal using node followed by the name of the script and the required inputs.


Here's an example of how to run the script:

`node update_dependency.js repositoryOwner repositoryName packageName packageVersion`

`repositoryOwner` - it is the name of the repository owner or more likely workspace name.

`repositoryName` - it is the name of the repository.

`packageName` - it is the name of the package you want to update.

`packageVersion` - it  is the version of the package you want to update to.

**Note**: Replace <username> and <password> or use <AUTH_TOKEN>(this can be repository access token or any other token) in the script with your BitBucket username and password.

**Note**: This code sample uses the 'node-fetch' library https://www.npmjs.com/package/node-fetch

**USEFULL LINK:**  https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-group-pullrequests
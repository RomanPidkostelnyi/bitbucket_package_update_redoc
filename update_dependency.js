const fetch = require('node-fetch');

/*
TODO: 
- add proper handle errors
- add posibility to include multiple packages
- test it properly
*/ 

const USERNAME = '<username>';
const PASSWORD = '<password>';
const AUTH_TOKEN = null; // <auth_token>

const Authorization_Header = AUTH_TOKEN 
    ? `Bearer ${AUTH_TOKEN}`
    : `Basic ${Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64')}`


const repositoryOwner = process.argv[2];
const repositoryName = process.argv[3];
const packageName = process.argv[4];
const packageVersion = process.argv[5];

const BASE_URL = `https://api.bitbucket.org/2.0/repositories/${repositoryOwner}/${repositoryName}`;

const newDeps = {
  dependencies: {
    [packageName]: packageVersion
  }
};


async function getBranch() {
  const res = await fetch(
    `${BASE_URL}/${repositoryOwner}/${repositoryName}/refs/branches`,
    {
      headers: {
        Authorization: Authorization_Header
      }
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to get branches: ${res.statusText}`);
  }

  const { values } = await res.json();
  return values[0].name;
}

async function updatePackageJson(branch_name) {
    // Get the contents of package.json
    const res = await fetch(`${BASE_URL}/src/${branch_name}/package.json`, {
      headers: {
        Authorization: Authorization_Header,        
        'Content-Type': 'application/json'
      }
    });
  
    if (!res.ok) {
      throw new Error(`Failed to get package.json: ${res.statusText}`);
    }
  
    const packageJson = await res.json();
  
    // Update the dependencies or devDependencies section with the new packages
    Object.entries(newDeps.dependencies).forEach((deps) => {
      packageJson.dependencies[deps[0]] = deps[1];
    });
  
    // Put the updated contents back to the repository
    const putRes = await fetch(`${BASE_URL}/src/${branch_name}/package.json`, {
      method: 'PUT',
      headers: {
        'Authorization': Authorization_Header,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(packageJson)
    });
  
    if (!putRes.ok) {
      throw new Error(`Failed to update package.json: ${putRes.statusText}`);
    }
  
    console.log(`Successfully updated package.json in branch "${branch_name}"`);
  }
  

async function createBranch(branch_name) {
  const res = await fetch(
    `${BASE_URL}/refs/branches`,
    {
      method: 'POST',
      headers: {
        Authorization: Authorization_Header,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: branch_name })
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to create branch: ${res.statusText}`);
  }
}

async function createPullRequest(source_branch, destination_branch) {
  const res = await fetch(
    `${BASE_URL}/pullrequests`,
    {
      method: 'POST',
      headers: {
        Authorization: Authorization_Header,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Update ${packageName} to ${packageVersion}`,
        description: `This pull request updates the ${packageName} dependency to version ${packageVersion}`,
        source: {
          branch: {
            name: source_branch
          }
        },
        destination: {
          branch: {
            name: destination_branch
          }
        },
        close_source_branch: true
      })
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to create pull request: ${res.statusText}`);
  }
}

async function updateAndCreatePullRequest() {
  const branch_name = `update-${packageName}`;
  const source_branch_name = getBranch();
  await createBranch(branch_name);
  await updatePackageJson(branch_name);
  await createPullRequest(branch_name, source_branch_name);

  console.log(`Successfully updated ${packageName} to ${packageVersion} and created pull request`);
}

updateAndCreatePullRequest().catch(console.error);

#!/usr/bin/env node

require('dotenv').config()

const pReduce = require('./lib/p-reduce');
const delay = require('delay');
const {Octokit} = require('@octokit/rest');
const octokit = new Octokit({
  auth: process.env.GH_AUTH_TOKEN,
  previews: ['dorian-preview', 'london-preview']
});

const [, , ...args] = process.argv;
const org = args[0];

console.log("org,repo,alert_url,alert_state,alert_secret_type,alert_secret");

async function go() {
  const iterator = octokit.paginate.iterator(octokit.rest.secretScanning.listAlertsForOrg, {
    org: org,
    per_page: 100,
  });

  // iterate through each response
  for await (const { data: secrets } of iterator) {
    for (const secret of secrets) {
      const repo = secret.repository.name;
      console.log(`${org},${repo},${secret.html_url},${secret.state},${secret.secret_type},${secret.secret}`);
    }
  }
}


try {
  go();
} catch (e) {
  console.error(e)
}

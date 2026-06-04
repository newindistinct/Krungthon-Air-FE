// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBhNrwYAMNTgzy5jgsXRWRlHY1sj0iUKbo",
    authDomain: "wft-qa-automation.firebaseapp.com",
    projectId: "wft-qa-automation",
    storageBucket: "wft-qa-automation.firebasestorage.app",
    messagingSenderId: "872748992656",
    appId: "1:872748992656:web:2a8a77b81344f409da7015"
  },
  defaultProjectId: '1',
  notifications: {
    discordWebhookUrl: 'https://discordapp.com/api/webhooks/1339467272950906910/l3E51KEkMSYk0bMV9DRrufqolQQnSmdTEIeGa3vfqxMuVi24o5nh07kR7fM_VrOY7GiK',
    lineApiUrl: 'https://sendlinemessage-abewfqcbgq-uc.a.run.app',
    lineGroupId: 'C495b9d94419095143c229b5e66ffa74e',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

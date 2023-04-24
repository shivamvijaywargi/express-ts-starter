## How to use Handlebars files

For this there are only 2 things that we use as of writing this README

- name
- link

These two are the dynamic variables that we inject in our handlebars template files dynamically, and these variables are collected from the payload object that we send inside the sendEmail().

### NOTE:

In your `sendEmail()` give template path as `../templates/{{templateName}}.handlebars` no matter where you call your `sendEmail()` method because the templates should be referenced from `sendEmail()` method folder.

EX:

```ts
// Below example is from the `auth.controller.ts: registerUser`
await sendEmail(
  newUser.email,
  'Account Verification',
  payload,
  '../templates/accountVerification.handlebars',
  // ^ Like this
);
```

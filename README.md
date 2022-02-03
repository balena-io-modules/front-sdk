# front-sdk
An SDK for working with Front (https://frontapp.com).

## TypeScript Quickstart

Import in the usual way:

```typescript
import { Front } from 'front-sdk';
```

## JavaScript

Require in the usual way:

```javascript
const Front = require('front-sdk').Front;
```

## Usage

Create a new instance of the SDK to use it, passing the API token for Front.

```typescript
import { Comment, Front } from 'front-sdk';
const front = new Front('abcdef123457890');

front.comment.create({
    conversation_id: 'cnv_xxxx',
    author_id: `alt:email:back@tofront`,
    body: 'It is very important that you see this comment!'
}).then((comment: Comment) => {
    console.log(comment);
}).catch(FrontError, (err: FrontError) => {
    console.log(err);
});
```

Can also be used as a callback, if required:

```typescript
front.comment.create({
    conversation_id: 'cnv_xxxx',
    author_id: `alt:email:back@tofront`,
    body: 'It is very important that you see this comment!'
}, (err: FrontError, comment: FrontComment) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log(comment);
});
```

Clients can register for events, passing an object detailing a port to listen on using a new instance of an Express server, or an instance of an Express server to use. An optional path to install the webhook on can also be passed (this defaults to `/fronthook`).

To use this functionality, pass the secret shared key in as the second parameter when creating a new Front instance.
```typescript
    import { Event, Front } from 'front-sdk';

    const frontInst = new Front('abcdef123457890', 'secretkey');
    const httpServer = frontInst.registerEvents({ port: 1234, hookPath: '/myhook' }, (err: FrontError, event: Event) => {
        if (err) {
            console.log(err);
        } else {
            console.log(event);
        }
    });
```

You can also use a pre-existing Express instance, but note that the Front SDK expects that the request body should be an already parsed object or a JSON parseable string. You can easily add this using the `body-parser` library:

```typescript
    import { Event, Front } from 'front-sdk';
    import * as bodyParser from 'body-parser';

    const app = express();
    app.use(bodyParser.json());
    app.listen(1234);

    const frontInst = new Front('abcdef123457890', 'secretkey');
    frontInst.registerEvents({ server: app, hookPath: '/myhook' }, (err: FrontError, event: Event) => {
        if (err) {
            console.log(err);
        } else {
            console.log(event);
        }
    });
```

The SDK will verify that events sent to it are signed by the shared secret key, and will retrieve the entire event rather than just the preview. Events are sent to the client in the order the preview events for them were originally dispatched.

#### Notes

To post into a Front Inbox, you need to know the correct channels in for it.
Channels are instances of sources, such as SMTP, Facebook, Front Integrations, etc.

So to post a new Conversation:
 * Find the Inbox required want
 * List the Channels and find the correct one for the source (Integration channels, in the SDK case)
 * Post a Message to that Channel (which will return a Conversation reference)

To post a Comment or Message to that Conversation:
 * Use the Conversation reference to post (returns a Comment or Message object)

## Running tests locally

Put [configuration](./test/keeper.ts) in `./test/creds.json` file and then run:

```
FRONT_TEST_KEYS=`node ./test/encode_keys.js ./test/creds.json` npm run test
```

# bandcamp-group-listen

## Improvements

- [x] Cloud function for calculating online users in a room. Downloading entire status node and counting children is not feasible. This feature will most likely only be for public rooms.

- [ ] Username/picture preview of who is currently in rooms (limit of 3 or so)

- [ ] Private rooms with specific user permissions. This would require online status to be a global value rather than per room and a distinction between private and public rooms.

- [x] Currently, Bandcamp audio source links have a token that only lasts an hour. Handled with client side magic by setting a rescrape flag and comparing expiry time of token.  Downloading to the server is extremely costly.

- [x] When no user remains in room, we remove start/end time on NowPlaying track and recalculate once someone rejoins the room.

- [ ] When Firebase token expires the onDisconnect handler doesn't seem to fire leaving a user who will be forever online. May need to provide timestamp for when a device was added and remove on client.

- [ ] Style with TailwindCSS.

### Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

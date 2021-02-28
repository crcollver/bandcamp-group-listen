# bandcamp-group-listen

## Improvements

- [x] Cloud function for calculating online users in a room. Downloading entire status node and counting children is not feasible. This feature will most likely only be for public rooms.

- [ ] Username/picture preview of who is currently in rooms (limit of 3 or so)

- [ ] Private rooms with specific user permissions. This would require online status to be a global value rather than per room and a distinction between private and public rooms.

- [ ] Currently, Bandcamp audio source links have a token that only lasts an hour. Handle this with clever client magic or download all audio to a storage bucket? A storage bucket would allow for future audio conversions like Youtube.

- [ ] When no user remains in room, we could (1) remove start/end time on NowPlaying track and recalculate once someone rejoins the room or (2) clear the entire queue.

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

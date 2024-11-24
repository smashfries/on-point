# on point

A simple web app to track the status and progress of your projects. Built to incentivize consistency and support individuals working on multiple projects in parallel.

> This project has just recently begun, and is therefore a work in progress. I primarily built it for myself and then chose to make it open-source. Feel free to submit self-host, submit issues, contribute, or fork.

## Developing

This is a monolith Sveltekit application. I have deployed this using the Node adapter, however others can easily be integrated.

### Environment Variables

In order to run this app, the following environment variables are needed. During development, they can easily be set by adding a `.env` file in the root of the project.

```
DATABASE_URL
SECRET
IPINFO_TOKEN
```

`DATABASE_URL` is the URL to a PostgreSQL database. `SECRET` can be any random string. It is used to sign tokens for authentication. `IPINFO_TOKEN` is used to authenticate with the IPinfo API to retrieve information about a user such as the region they are from. This is purely for basic analytical purposes.

Install dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
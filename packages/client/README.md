# Client

## Run locally
exec in this directory:
- `node ./setup-local-to-prod`
- serve client
  - `yarn start` --> [http://localhost:4200](http://localhost:4200)
  - `yarn start:ssr` --> [http://localhost:4000](http://localhost:4000)
  
## Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests
Run `ng test` to execute the unit tests with Jest.

## Hints

> Weekly report PDF +  PNG/JPEG Card downloads won't work locally

### Using data endpoints other than prod (internal only)
Write the basic auth to the browsers local storage:
- `localStorage.setItem('DATA_ENDPOINT_AUTH', 'basic ...')`

#### When using SSR
Start ssr with the env var `DATA_ENDPOINT_AUTH`
- `DATA_ENDPOINT_AUTH="basic ..." yarn start:ssr`

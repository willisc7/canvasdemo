### Setup
0. `docker build . -t us-central1-docker.pkg.dev/app-canvas-421915/docker-repo/appcanvas`
0. `docker push us-central1-docker.pkg.dev/app-canvas-421915/docker-repo/appcanvas`

### Demo
0. Cloud Run > Manage Application
0. Prompt: `I want a webapp that uses an LLM to generate birthday party ideas.  The app can then save those ideas in a database`
0. Prompt: `Change the database to Firestore`
0. Deploy
0. Cloud Run > Edit > Deploy new image
0. Ensure unauthenticated invocations and network traffic from all sources is turned on
0. Load the webpage and input stuff and save it
0. Show the data in firebase

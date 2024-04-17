const express = require('express');
const ejs = require('ejs');
const { VertexAI } = require('@google-cloud/vertexai');
const { Firestore } = require('@google-cloud/firestore');
const gcpMetadata = require('gcp-metadata');

const projectId = await gcpMetadata.project('project-id');
const region = await gcpMetadata.instance('region');
const vertex_ai = new VertexAI({ project: projectId, location: region });
const model = 'gemini-1.0-pro-001';

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    'maxOutputTokens': 2048,
    'temperature': 0.9,
    'topP': 1,
  },
  safetySettings: [
    {
      'category': 'HARM_CATEGORY_HATE_SPEECH',
      'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
      'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      'category': 'HARM_CATEGORY_HARASSMENT',
      'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ],
});


// Initialize Cloud Firestore client
const db = new Firestore({ projectId: projectId, databaseId: process.env.FIRESTORE_DB_NAME });

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Home page
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/generate', async (req, res) => {
  const name = req.body.name;
  const age = req.body.age;

  // Call Vertex AI (using GenerativeModel) for party ideas
  const prompt = `Generate 5 birthday party ideas for a child named ${name} who is turning ${age}. 
  Include themes. Please do not include any specific references to copyrighted intellectual property.
  Print the characters $$ before each theme.
  here is an example of the desired output format of a party idea: 
  $$
  SUPERHERO PARTY
  Decorate with superhero logos and colors
  Set up obstacle courses and target practice games
  Serve superhero-themed snacks like 'Cape Cupcakes' and 'Power Punch'
  `;
  const request = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };
  const result = await generativeModel.generateContent(request);
  const response = result.response;
  console.log('Response: ', JSON.stringify(response));
  const ideas = response.candidates[0].content.parts[0].text.split("$$")

  res.render('ideas', { name, age, ideas });
});

// Save ideas to Firestore
app.post('/save', async (req, res) => {
  const ideasToSave = req.body.ideas;

  console.log(req.body)
  try {
    const docRef = await db.collection('ideas').add({ ideas: ideasToSave });
    console.log('Ideas saved with ID:', docRef.id);
    res.redirect('/');
  } catch (error) {
    console.error('Error saving ideas:', error);
    res.status(500).send('Error saving ideas');
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
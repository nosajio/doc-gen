# DocGen

Example:  
`$ node generate --project my-project-name`  
Where `my-project-name` is the name of the .json settings file contained in the projects directory.

## Structure of a `project file`
```json
{
  "template": "invoice",
  "name": "Test Project",
  "tags": {
    "title": "#420",
    "payee": {
      "name": "Some Person",
      "email": "jason@nosaj.io"
    },
    "payer": {
      "name": "Some Other Person",
      "email": "human@graft.co"
    },
    "payment": {
      "bank": "PiggyBank co",
      "name": "MR Some Person",
      "sortcode": "12-34-21",
      "accountno": "12345678"
    },
    "work": [
      {
        "task": "Make sparkles",
        "cost": 10
      },
      {
        "task": "Bear Grooming (2 days)",
        "cost": 400.30
      },
      {
        "task": "Debrief (30 mins)",
        "cost": 0.95
      }
    ]
  }
}
```

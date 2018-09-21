# `fetch-license` micro-service

A single end-point `/package?name=packageName` to get information about the license of a given package and all its dependencies.

Uses `legally` package from Francisco Presencia

Example of output fpr `unstated` package:

```json
{
  "status": "OK",
	"report": {
		"MIT": 2
	},  
	"packages": {
		"create-react-context@0.1.6": [
			"MIT"
		],
		"unstated@2.1.1": [
			"MIT"
		]
	}
}
```
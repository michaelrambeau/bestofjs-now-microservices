# `fetch-license` micro-service

A single end-point `/:packageName` to get information about the license of a given package and all its dependencies.

Uses `legally` package from Francisco Presencia

Example of output fpr `unstated` package:

```json
{
  "status": "OK",
	"report": {
		"MIT": 2,
		"ISC": 1
	},  
	"packages": {
		"create-react-context@0.1.6": [
			"MIT"
		],
		"pack-unstated@1.0.0": [
			"ISC"
		],
		"unstated@2.1.1": [
			"MIT"
		]
	}
}
```
const fs = require('fs');

function txtToJson(txtFile, jsonFile) {
  fs.readFile(txtFile, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }

    const lines = data.split('\n').map(line => line.trim());

    const jsonData = JSON.stringify(lines, null, 4);

    fs.writeFile(jsonFile, jsonData, (err) => {
      if (err) {
        console.error(`Error writing file: ${err}`);
      } else {
        console.log(`JSON file created: ${jsonFile}`);
      }
    });
  });
}

const txtFile = 'input.txt';  
const jsonFile = 'output.json'; 

txtToJson(txtFile, jsonFile);

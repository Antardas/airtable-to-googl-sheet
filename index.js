const express = require('express');
const app = express();
const Airtable = require('airtable')
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const base = new Airtable({apiKey: 'keyaGLDi1AmiTrJr0'}).base('appICrWJSOjEe0zxD');






app.get('/', async (req, res) => {

let data = []
    base('Assignment').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 100,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
    
        data = records.map(function(record) {
           return [
            record.get("First Name"),
            record.get("Last Name"),
            record.get("Email"),
            record.get("Phone")
          ]
        
        //    return {
        //     firstName: record.get("First Name"),
        //     lastName: record.get("Last Name"),
        //     email: record.get("Email"),
        //     phone: record.get("Phone"),
        // }

        });
        console.log(data)
    
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    
    }, function done(err) {
        if (err) { console.error(err); return; }
    });

    // Create a google authetication instance
    const auth = new google.auth.GoogleAuth({
      keyFile: "credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
  
    // Create client instance for auth
    const client = await auth.getClient();
  
    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });
  
    const spreadsheetId = "1kmK9I-5r-P-IH_sUsorvyuOf72MMrRSNy5YrobsdbxA";
  
    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });


    // read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "Sheet1"
    })
    // extract Here airtable data array 
    const [firstName, lastName, email, phone] = data;

    // If data fetch successfully from airtable then saved fetched data saved in google from 
   data.length && await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
            ...data
        ]
      }
    })
    res.status(200).json({message: 'hellow', data:getRows.data});
})



app.listen(4000, () => {
    console.log('listening on port', 4000)
})
To use this locally, just change the discipline you like the calendar from Janus and run the code.
To put the .ics file on google calendar, follow the steps below:

pt-br: https://support.google.com/calendar/answer/37118?hl=pt-BR
english:https://support.google.com/calendar/answer/37118?hl=EN


To edit or use this code locally you will need  Node.js (> v8).

 **Clone** the repository.

	```bash
	$ git clone https://github.com/lubianat/USP2calendar
    $ cd USP2calendar
	```

Install npm dependencies

```bash
	$ npm install
    $ npm i puppeteer
    $ npm i ical-toolkit
	```

Then you open the ical-janus-parser.js and change  the 'discipline' parameter and run with 

```bash
	$ node ical-janus-parser.js
	```

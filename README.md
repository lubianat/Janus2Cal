To use this locally, just change the discipline you like the calendar from Janus and run the code.



To edit or use this code locally you will need  Node.js (> v8).

 **Clone** the repository.

	```bash
	$ git clone https://github.com/lubianat/Janus2Cal
    $ cd Janus2Cal
	```

Install npm dependencies

```bash
	$ npm install
    $ npm i puppeteer
    $ npm i ical-toolkit
	```

Then you run the script "ical-janus-parser.js" followed by the code of your discipline of interest ( such as "BMI5897")

```bash
	$ node ical-janus-parser.js BMI5897
	```

A .ics file will be generated with the appointments for the selected course in the Janus2Cal folder. Now you just proceed to put the .ics file on google calendar, following the steps below:

pt-br: https://support.google.com/calendar/answer/37118?hl=pt-BR
english:https://support.google.com/calendar/answer/37118?hl=EN
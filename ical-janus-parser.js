// Copyright (C) 2018  Tiago Lubiana

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>. */}
// Contact email : tiago.lubiana.alves@usp.br

// This code takes the ID of Janus disciplines and downloads the content related to the discipline
// as a Google Calendar compatible .ics file



// process.argv[2] takes any command line argument. You should put the code of the discipline there.

disciplina = process.argv[2] //example
var fs = require('fs')
janus2calendar = function (disciplina) {
    const puppeteer = require('puppeteer');
    var fs = require('fs')
    //escolha a disciplina
    //ICB5754
    //BMI5863


    let scrape = async () => {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto('https://uspdigital.usp.br/janus');
        await page.waitFor(300);
        await page.click('#pos-componente > ul > li:nth-child(2) > a');
        await page.waitFor(300);
        const frame = await page.frames().find(f => f.name() === 'casca')
        const sgldis = await frame.$('#sgldis');
        await sgldis.type(disciplina);
        const submit = await frame.$('body > form:nth-child(1) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > font > span > input[type="SUBMIT"]');
        await submit.click()
        await page.waitFor(300);
        const oferecimento = await frame.$('body > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > table > tbody > tr:nth-child(2) > td:nth-child(4) > a > img')
        await oferecimento.click()
        let fna = "./" + disciplina + '.html'
        console.log(fna)
        await page.waitFor(300);
        var body = page.url()
        var res = body.substr(body.length - 13, body.length);
        body = 'https://uspdigital.usp.br/janus/TurmaDet?sgldis=' + res
        await page.goto(body);
        console.log(body)
        await page.waitFor(300);

        var result = 'ok'
        result = await page.evaluate(() => {

            let prof = document.querySelector('body > table > tbody > tr:nth-child(16) > td > table > tbody > tr:nth-child(2) > td > font:nth-child(1) > span').innerText;
            let name = document.querySelector('body > table > tbody > tr:nth-child(2) > td > div > font > span > strong').innerText;
            let end = document.querySelector('body > table > tbody > tr:nth-child(12) > td > font:nth-child(4) > span').innerText;
            let beg = document.querySelector('body > table > tbody > tr:nth-child(12) > td > font:nth-child(2) > span').innerText;
            let days = document.querySelectorAll('body > table > tbody > tr:nth-child(19) > td > table > tbody > tr');
            let local = document.querySelector('body > table > tbody > tr:nth-child(19) > td > table > tbody > tr > td:nth-child(3)').innerText;
            const nodelistToArray = Array.apply(null, days);
            var wk = {};
            for (i = 1; i < nodelistToArray.length + 1; i++) {
                let wkday = document.querySelector(' body > table > tbody > tr:nth-child(19) > td > table > tbody > tr:nth-child(' + i + ') > td:nth-child(1)').innerText;
                let wkhour = document.querySelector(' body > table > tbody > tr:nth-child(19) > td > table > tbody > tr:nth-child(' + i + ') > td:nth-child(2)').innerText;
                wk[wkday] = wkhour
            }
            

            return { name, prof, end, beg, wk, local }
        });
        browser.close()
        result['url'] = body
        return result;

    };
    //scrapes Janus for the needed info
    scrape().then((info) => {

        // obj to hold the calendars
        var icalToolkit = require('ical-toolkit');
        var cals = {}
        var j;
        for (j in info.wk) {
            //Create a builder
            var builder = icalToolkit.createIcsFileBuilder();

            builder.spacers = true;
            builder.NEWLINE_CHAR = '\n'; //Newline char to use.
            builder.throwError = false;
            builder.ignoreTZIDMismatch = true;

            builder.calname = disciplina;

            builder.tzid = 'america/sao_paulo'

            var end = info.end.split("/")
            var beg = info.beg.split("/")
            var endDate = new Date(end[2], Number(end[1]) - 1, end[0])
            var begDate = new Date(beg[2], Number(beg[1]) - 1, beg[0])


            var days;
            var i = j;
                if(i=="Segunda"){
                   days = 1
                }
                if(i=="Terça" || i=="'Terça'"){
                    days = 2     
                }
                if(i=="Quarta"){
                    days = 3
                }
                if(i=="Quinta"){
                   days = 4
                }
                if(i=="Sexta"){
                   days = 5
                }
             if (begDate.getDay() == 1){
                console.log('monday')
                 days -= 1
             }
            begDate.setTime( begDate.getTime() + days * 86400000 );

            var endTime = begDate
            var begHr = info.wk[i].split(" - ")[0].split(':')[0]
            var begMin = info.wk[i].split(" - ")[0].split(':')[1]
            var endHr = info.wk[i].split(" - ")[1].split(':')[0]
            var endMin = info.wk[i].split(" - ")[1].split(':')[1]
            begDate = new Date(begDate.getFullYear(), begDate.getMonth(), begDate.getDate(), begHr, begMin, 0)
            endTime = new Date(endTime.getFullYear(), endTime.getMonth(), endTime.getDate(), endHr, endMin, 0)


            builder.events.push({

                start: begDate,

                end: endTime,

                transp: 'OPAQUE',

                summary: info.name + ' - ' + info.prof,

                repeating: {
                    freq: 'WEEKLY',
                    until: endDate
                },
                location: info.local,

                url: info.url

            })



            var icsFileContent = builder.toString();
            cals[j] = icsFileContent

        }
        //Here isteh ics file content.


        var k;
        var icals = []
        for (k in info.wk) {
            icals.push(cals[k])


        }


        var begCal = icals[0].search('BEGIN:VEVENT')
        var endCal = icals[0].search('END:VEVENT')


        var l;
        var final;
        for (l = 0; l < icals.length; l++) {
            var begCal = icals[l].search('BEGIN:VEVENT')

            var endCal = icals[l].search('END:VEVENT')
            var dist = endCal - begCal
            if (l == 0) {
                final = icals[l].substr(0, endCal + 12)
            }
            else {
                final = final + icals[l].substr(begCal, dist + 12)
            }
        }
        final = final + icals[0].substr(endCal + 12)
        // console.log(final)

        fs.writeFile(disciplina + '.ics', final)


        // The code below is for if you want ot send an e-mail with calendars
        // for (l = 0; l < icals.length; l++) {
        //     var send = require('gmail-send')({
        //         //var send = require('../index.js')({
        //         user: 'from@gmail.com',
        //         pass: 'password',
        //         to: to@email.com,
        //         subject: 'Calendário para disciplina ' + disciplina + '[E-Mail automático, favor não responder]',
        //         text: 'Olá, o calendário acima corresponde ao dia e horário da disciplina ' + disciplina + '. Disciplinas com mais de um dia por semana, possuem mais de um evento, devido à forma que o gmail lida com isso. Então para funcionar bonitinho, adicione todos, pode ser? :)'
        //     });
        //     console.log('* [example 1.1] sending test email');

        //     fs.writeFile(disciplina + '_' + l + '.ics', icals[l])
        //     var filepath = './' + disciplina + '_' + l + '.ics';  // File to attach
        //     send({
        //         subject: 'Calendário para Disciplina ' + filepath,         // Override value set as default
        //         files: [filepath],
        //     }, function (err, res) {
        //         console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
        //     });


        // }

    }).catch(function(motivo) {
        console.log(motivo)
        // rejeição
     });

}

janus2calendar(disciplina)
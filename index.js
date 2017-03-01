const fs = require('fs');
const Converter = require('csvtojson').Converter;
const path = require('path');
const chalk = require('chalk');

let listaFinale;
let listaBounced;

new Converter({})
.fromFile('./lists/input/garganti.csv', (err, dettagli) => {
  if (err) { console.log(`error: ${err}`); }

  listaFinale = dettagli;

  new Converter({})
  .fromFile('./lists/input/bounced.csv', (err, bounced) => {
    if (err) { console.log(`error: ${err}`); }

    listaBounced = bounced;

    // Rimuovo duplicati
    listaFinale = removeDuplicates(listaFinale, 'Garganti');

    // Rimuovo bounced
    listaFinale = removeBounced(listaFinale, listaBounced, 'Garganti');

    // Esporta lista di indirizzi da importare in Mailchimp
    printListaMailchimp(listaFinale);
  });
});

// Remove duplicate contacts from an input list
function removeDuplicates(inputList, listName) {
  console.log('\nRimuovo duplicati dalla lista', chalk.yellow(listName), '\n');
  let ret = [];

  inputList.forEach((contact) => {
    console.log(contact);
    let isDuplicate = false;

    for (let i = 0; i < ret.length; i++) {
      let entry = ret[i];

      // If filtered list contains this address, we don't push it in
      if (entry.email === contact.email) {
        // console.log(chalk.red('    Duplicato:'),  entry.email);
        isDuplicate = true;
      }
    }

    // Otherwise, we push it
    if (!isDuplicate) {
      ret.push(contact);
    }
  });

  console.log(chalk.green('    Rimossi', inputList.length - ret.length,
    'duplicati'));
  return ret;
}

// Remove bounced contacts from a list
function removeBounced(inputList, bouncedList, listName) {
  console.log('\nRimuovo bounced dalla lista', chalk.yellow(listName), '\n');
  const ret = [];

  inputList.forEach((contact) => {
    let isBounced = false;

    for (let i = 0; i < bouncedList.length; i++) {
      let entry = bouncedList[i];

      // If filtered list contains this address, we don't push it in
      if (entry['Email Address'] === contact.email) {
        // console.log(chalk.red('    Bounced:'),  entry['Email Address']);
        isBounced = true;
      }
    }

    // Otherwise, we push it
    if (!isBounced) {
      ret.push(contact);
    }
  });

  console.log(chalk.green('    Rimossi', inputList.length - ret.length,
    'bounced'));
  return ret;
}

// Stampa la lista di Dettagli, in formato CSV, ripulita da duplicati e bounced
function printListaDettagli(lista) {
  let strLista = 'data inserimento, email';

  for (let entry of lista) {
    strLista += '\n' + entry['data inserimento'] + ', ' + entry['email'];
  }

  fs.writeFile('./lists/output/dettagli.csv', strLista, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('\nLista Dettagli salvata nel file',
      chalk.magenta(path.resolve('./lists/output/dettagli.csv')));
  });
}

// Stampa la lista unica per mailchimp, ripulita da duplicati e bounced
function printListaMailchimp(lista) {
  // Print out to file
  let strLista = '';

  for (let entry of lista) {
    strLista += entry['email'] + '\n';
  }

  fs.writeFile('./lists/output/mailchimp.csv', strLista, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('\nLista per Mailchimp salvata nel file',
      chalk.magenta(path.resolve('./lists/output/mailchimp.csv')));
  });
}

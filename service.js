var rp = require('request-promise');
var firebase =  require('./firebase');
var service = {};

async function getCompanySymbols() {
    try {
        const res = await rp('https://api.iextrading.com/1.0/ref-data/symbols');
        const companies = JSON.parse(res);
        let symbols = [];
        
        companies.forEach( company => {
            if(company.type != 'crypto'){
                symbols.push(encodeURIComponent(company.symbol));
            } 
         });

        return symbols;
    } catch(e) {
        console.log('Ocurrio un error', e);
    }
}

function getUrlEncode(symbols) {
   
    let urls = [];
    let j = 0;
    let url = '';

    for(let i = 0; i<symbols.length; i++) {
        url += `${symbols[i]},`;

        if(j == 100 || i  == symbols.length-1) {
            j = 0;
            urls.push(`https://api.iextrading.com/1.0/stock/market/batch?symbols=${url}&types=quote,stats`);
            url = '';
        }
        j++;
    }
    return urls;
}

async function goUrl(url) {
    try {
        const body = await rp(url);
        const companies = JSON.parse(body);
        return companies;
    } catch(e) {
        console.log('Ocurrio un error', e);
    }
}

async function getCompanies(urls) {
        let finalCompanies = [];
        let com = {};

        try {
            for(let i = 0; i < 1; i++) {
                let companies = await goUrl(urls[i]);
                for(let company in companies) {
                    let exchange =  companies[company].quote.primaryExchange.toLowerCase();
                    let marketCap = companies[company].quote.marketCap;
                    let sector = companies[company].quote.sector === "" ? "-" : companies[company].quote.sector;
                    let ttmEps = typeof(companies[company].stats.ttmEPS)  === null ? 0: 
                    parseFloat(companies[company].stats.ttmEPS.toFixed(2));
                    let peRatio = companies[company].quote.peRatio === null ? 0: 
                            parseFloat(companies[company].quote.peRatio.toFixed(2));
                    if((exchange == 'new york stock exchange' || 
                        exchange == 'nasdaq global market' ||
                        exchange == 'nasdaq global select' ||
                        exchange == 'nasdaq capital market') && marketCap > 50000000 
                        && sector != 'Financial Services' && peRatio > 5) {
                            com.symbol = companies[company].quote.symbol;
                            com.name = companies[company].quote.companyName;
                            com.sector = sector;
                            if(exchange == 'new york stock exchange'){
                                com.exchange = 'NYSE';
                            } else {
                                com.exchange = 'NASDAQ';
                            }
                            com.latestPrice = companies[company].quote.latestPrice;
                            com.marketCap = marketCap;
                            com.peRatio = peRatio;
                            com.earningYield = earningYield(com.latestPrice, ttmEps);
                            com.returnOnAssets = companies[company].stats.returnOnAssets;
                            com.returnOnEquity = companies[company].stats.returnOnEquity;
                            com.ttmEps = ttmEps;
                            finalCompanies.push(com);
                            com = {};
                    }
                }
            }
            return finalCompanies; 
        } catch(e) {
            console.log('Ocurrio un error', e);
        }  
}

async function all() {
    try {
        const symbols = await getCompanySymbols();
        const urls = getUrlEncode(symbols);
        const companies = await getCompanies(urls);
        saveCompanies(companies);
    } catch(e) {
        console.log('Ocurrio un error', e);
    }  
}

function earningYield(lastPrice, eps) {
    let resul = (eps/lastPrice)*100;
    return parseFloat(resul.toFixed(2));
}

function saveCompanies(companies) {
    let db = firebase.getConfig();

    companies.forEach(company => {
        var comapanyDocRef = db.collection("companies").doc(company.symbol);
        comapanyDocRef.set(company).then(() =>{
           
        }).catch((e) => {
            console.log('Hubo un error',e );
        })
    });
}

service.all = all;
module.exports = service;


    
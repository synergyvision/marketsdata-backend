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
    console.log('Simbolos: ', symbols.length);
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
        let marketcapTOP = 50000000;
        let peRatioTOP = 5;
        let sectors = [];
        try {
            for(let i = 0; i < urls.length; i++) {
                let companies = await goUrl(urls[i]);
                
                for(let company in companies) {
                    let exchange =  companies[company].quote.primaryExchange.toLowerCase();
                    let marketCap = companies[company].quote.marketCap;
                    let sector = companies[company].quote.sector === "" ? "-" : companies[company].quote.sector;
                    
                    let ttmEps = typeof(companies[company].stats.ttmEPS)  == 'number' ? 
                    parseFloat(companies[company].stats.ttmEPS.toFixed(2)): 0;
                    let peRatio = typeof(companies[company].quote.peRatio) == 'number' ? 
                    parseFloat(companies[company].quote.peRatio.toFixed(2)) : 0;
                    if(sectors.indexOf(sector) == -1 && sector != "-" && sector != 'Financial Services')
                        sectors.push(sector);
                    if((exchange == 'new york stock exchange' || 
                        exchange == 'nasdaq global market' ||
                        exchange == 'nasdaq global select' ||
                        exchange == 'nasdaq capital market') && marketCap > marketcapTOP
                        && sector != 'Financial Services' && peRatio > peRatioTOP) {
                            com.symbol = companies[company].quote.symbol;
                            com.name = companies[company].quote.companyName;
                            com.sector = sector;
                            if(exchange == 'new york stock exchange') {
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
                            com.beta = companies[company].stats.beta;
                            com.week52high = companies[company].stats.week52high;
                            com.week52low = companies[company].stats.week52low;
                            com.week52change = companies[company].stats.week52change;
                            com.dividendRate = companies[company].stats.dividendRate;
                            com.dividendYield = companies[company].stats.dividendYield;
                            com.latestEPS = companies[company].stats.latestEPS;
                            com.sharesOutstanding = companies[company].stats.sharesOutstanding;
                            com.float = companies[company].stats.float;
                            com.consensusEPS = companies[company].stats.consensusEPS;
                            com.numberOfEstimates = companies[company].stats.numberOfEstimates;
                            com.peRatioHigh = companies[company].stats.peRatioHigh;
                            com.peRatioLow = companies[company].stats.peRatioLow;
                            com.profitMargin = companies[company].stats.profitMargin;
                            com.priceToSales = companies[company].stats.priceToSales;
                            com.priceToBook = companies[company].stats.priceToBook;
                            com.day200MovingAvg = companies[company].stats.day200MovingAvg;
                            com.day50MovingAvg = companies[company].stats.day50MovingAvg;
                            com.institutionPercent = companies[company].stats.institutionPercent;
                            com.insiderPercent = companies[company].stats.insiderPercent;
                            com.year5ChangePercent = companies[company].stats.year5ChangePercent;
                            com.year2ChangePercent = companies[company].stats.year2ChangePercent;
                            com.year1ChangePercent = companies[company].stats.year1ChangePercent;
                            com.ytdChangePercent = companies[company].stats.ytdChangePercent; 
                            finalCompanies.push(com);
                            com = {};
                    }
                }
            }
            saveSectors(sectors);
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
    console.log('Total de compañias', companies.length);
    companies.forEach(company => {
        var comapanyDocRef = db.collection("companies").doc(company.symbol);
        comapanyDocRef.set(company).then(() =>{
           
        }).catch((e) => {
            console.log('Hubo un error',e );
        })
    });
}

function saveSectors(sectors) {
    let db = firebase.getConfig();

    sectors.forEach(sector => {
        var sectorDocRef = db.collection("sectors").doc(sector);
        sectorDocRef.set({name: sector}).then(() =>{
           
        }).catch((e) => {
            console.log('Hubo un error',e );
        })
    });
}

service.all = all;
module.exports = service;


    
var rp = require('request-promise');
var firebase =  require('./firebase');
var service = {};
var public_key = 'pk_3588cd80280a48dc882e3d07e83fc7a6';

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
            urls.push(`https://cloud.iexapis.com/stable/stock/market/batch?token=${public_key}&symbols=${url}&types=quote,stats,company`);
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
                    let sector = companies[company].company.sector === "" ? "-" : companies[company].company.sector;
                    
                    let ttmEps = typeof(companies[company].stats.ttmEPS)  == 'number' ? 
                    parseFloat(companies[company].stats.ttmEPS.toFixed(2)): 0;
                    let peRatio = typeof(companies[company].quote.peRatio) == 'number' ? 
                    parseFloat(companies[company].quote.peRatio.toFixed(2)) : 0;
                    if(sectors.indexOf(sector) == -1 && sector != "-" && sector != 'Finance' && sector != 'Government')
                        sectors.push(sector);
                    if((exchange == 'new york stock exchange' || exchange == 'nasdaq') && marketCap > marketcapTOP
                        && sector != 'Finance' && sector != 'Government' && peRatio > peRatioTOP) {
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
                            // com.returnOnAssets = companies[company].stats.returnOnAssets;
                            // com.returnOnEquity = companies[company].stats.returnOnEquity;
                            com.ttmEps = ttmEps;
                            com.beta = typeof(companies[company].stats.beta)  == 'number' ? 
                            parseFloat(companies[company].stats.beta.toFixed(3)): 0;
                            com.week52high =  typeof(companies[company].stats.week52high)  == 'number' ? 
                            companies[company].stats.week52high: 0; 
                            com.week52low = typeof(companies[company].stats.week52low)  == 'number' ? 
                            companies[company].stats.week52low: 0;
                            com.week52change = typeof(companies[company].stats.week52change)  == 'number' ? 
                            parseFloat(companies[company].stats.week52change.toFixed(3)): 0;
                            // com.dividendRate = typeof(companies[company].stats.dividendRate)  == 'number' ? 
                            // parseFloat(companies[company].stats.dividendRate.toFixed(2)): 0;
                            com.dividendYield = typeof(companies[company].stats.dividendYield)  == 'number' ? 
                            parseFloat(companies[company].stats.dividendYield.toFixed(3)): 0;
                            // com.latestEPS = typeof(companies[company].stats.latestEPS)  == 'number' ? 
                            // parseFloat(companies[company].stats.latestEPS.toFixed(3)): 0;
                            com.sharesOutstanding = typeof(companies[company].stats.sharesOutstanding)  == 'number' ? 
                            companies[company].stats.sharesOutstanding: 0;
                            com.float = typeof(companies[company].stats.float)  == 'number' ? 
                            companies[company].stats.float: 0;
                            // com.consensusEPS = typeof(companies[company].stats.consensusEPS)  == 'number' ? 
                            // companies[company].stats.consensusEPS: 0;
                            // com.numberOfEstimates = typeof(companies[company].stats.numberOfEstimates) == 'number' ?
                            // companies[company].stats.numberOfEstimates: 0;
                            // com.peRatioHigh = typeof(companies[company].stats.peRatioHigh)  == 'number' ? 
                            // companies[company].stats.peRatioHigh: 0;
                            // com.peRatioLow = typeof(companies[company].stats.peRatioLow)  == 'number' ? 
                            // companies[company].stats.peRatioLow: 0;
                            // com.profitMargin = typeof(companies[company].stats.profitMargin)  == 'number' ? 
                            // companies[company].stats.profitMargin: 0;
                            // com.priceToSales = typeof(companies[company].stats.priceToSales)  == 'number' ? 
                            // parseFloat(companies[company].stats.priceToSales.toFixed(3)): 0;
                            // com.priceToBook = typeof(companies[company].stats.priceToBook)  == 'number' ? 
                            // parseFloat(companies[company].stats.priceToBook.toFixed(3)): 0;
                            com.day200MovingAvg = typeof(companies[company].stats.day200MovingAvg)  == 'number' ? 
                            parseFloat(companies[company].stats.day200MovingAvg.toFixed(3)): 0;
                            com.day50MovingAvg = typeof(companies[company].stats.day50MovingAvg)  == 'number' ? 
                            parseFloat(companies[company].stats.day50MovingAvg.toFixed(3)): 0;
                            // com.institutionPercent = typeof(companies[company].stats.institutionPercent)  == 'number' ? 
                            // companies[company].stats.institutionPercent: 0;
                            // com.insiderPercent = typeof(companies[company].stats.insiderPercent)  == 'number' ? 
                            // companies[company].stats.insiderPercent: 0;
                            com.year5ChangePercent = typeof(companies[company].stats.year5ChangePercent)  == 'number' ? 
                            parseFloat(companies[company].stats.year5ChangePercent.toFixed(3)): 0;
                            com.year2ChangePercent = typeof(companies[company].stats.year2ChangePercent)  == 'number' ? 
                            parseFloat(companies[company].stats.year2ChangePercent.toFixed(3)): 0;
                            com.year1ChangePercent = typeof(companies[company].stats.year1ChangePercent)  == 'number' ? 
                            parseFloat(companies[company].stats.year1ChangePercent.toFixed(3)): 0;
                            com.ytdChangePercent = typeof(companies[company].stats.ytdChangePercent)  == 'number' ? 
                            parseFloat(companies[company].stats.ytdChangePercent.toFixed(3)): 0; 
                            com.open = companies[company].quote.open;
                            com.close = companies[company].quote.close;
                            com.high = companies[company].quote.high;
                            com.low = companies[company].quote.low;
                            finalCompanies.push(com);
                            await saveCompany(com);
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
        // saveCompanies(companies);
    } catch(e) {
        console.log('Ocurrio un error', e);
    }  
}

function earningYield(lastPrice, eps) {
    let resul = (eps/lastPrice)*100;
    return parseFloat(resul.toFixed(2));
}

async function saveCompany(company) {
    let db = firebase.getConfig();
    var comapanyDocRef = db.collection("companies").doc(company.symbol);
        comapanyDocRef.set(company).then(() =>{
            
        }).catch((e) => {
            console.log('Hubo un error',e );
        })
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

async function alltwo() {
    try {
        const symbols = await getCompanySymbols();
        const urls = getUrlEncode(symbols);
        console.log(urls);
    } catch(e) {
        console.log('Ocurrio un error', e);
    }  
}

service.all = all;
module.exports = service;


    
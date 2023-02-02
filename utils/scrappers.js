const request = require('request');
const cheerio = require('cheerio');
const { formatDate } = require('./commonTils');


const fakeHadersList = [
    {
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Windows; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.114 Safari/537.36",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-site": "none",
        "sec-fetch-mod": "",
        "sec-fetch-user": "?1",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "bg-BG,bg;q=0.9,en-US;q=0.8,en;q=0.7"
    },
    {
        "user-agent": "Mozilla/5.0",
    },
    {
        "user-agent":   'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18',
    },
    {
        "user-agent":   'Opera/9.80 (Linux armv7l) Presto/2.12.407 Version/12.51 , D50u-D1-UHD/V1.5.16-UHD (Vizio, D50u-D1, Wireless)',
    },
    {
        "user-agent":   'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
    },
    {
        "user-agent":   'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-CN; EML-AL00 Build/HUAWEIEML-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 baidu.sogo.uc.UCBrowser/11.9.4.974 UWS/2.13.1.48 Mobile Safari/537.36 AliApp(DingTalk/4.5.11) com.alibaba.android.rimet/10487439 Channel/227200 language/zh-CN',
    },
    {
        "user-agent":    'Mozilla/5.0 (X11; U; Linux i686; en-US) U2/1.0.0 UCBrowser/9.3.1.344',
    },
    {
        "user-agent":    'UCWEB/2.0 (Java; U; MIDP-2.0; Nokia203/20.37) U2/1.0.0 UCBrowser/8.7.0.218 U2/1.0.0 Mobile'
    },
];


const scrapper_getdroidtips = (webUrl) =>{
    return new Promise((resolve,reject)=>{
        try {
            const options = {
                method: 'GET',
                url: webUrl,
                // headers: fakeHadersList[7]
                headers: fakeHadersList[Math.floor(Math.random()*fakeHadersList.length)]
            }
            const resultData = [];
            request(options,(error,response,html)=>{
                // console.log(response.statusCode);
                if (!error && response.statusCode === 200) {
                    const $ = cheerio.load(html);
                    
                    // const siteHeading = $('.site-title a');
                    // console.log(siteHeading.text());
                    // console.log(siteHeading.html());
                    // const dataObj = {};
                    // $('.post-summary__title').each((idx,el)=>{
                    //     const blogTitle = $(el).text();
                    //     const blogUrl = $(el).children('a').attr("href");
                    //     console.log(blogUrl);
                    //     resultData.push({blogTitle,blogUrl})
                    // })

                    $('.post-summary__content').each((idx,el)=>{
                        const blogTitle = $(el).children(".post-summary__title").text();
                        const blogUrl = $(el).children(".post-summary__title").children('a').attr("href");
                        const time = $(el).children(".post-summary__byline").children(".entry-date").text();
                        // console.log(time);
                        if (time) resultData.push({blogTitle,blogUrl,time});
                        
                    })
                    // console.log(resultData);
                    resolve(resultData);
                }else{
                    reject(response)
                }
    
            });
        } catch (error) {
            console.log(error);
            reject(error);
        }
    })
}


const scrapper_hardreset = (webUrl,baseUrl) =>{
    return new Promise((resolve,reject)=>{
        try {
            const options = {
                method: 'GET',
                url: webUrl,
                headers: fakeHadersList[Math.floor(Math.random()*fakeHadersList.length)]
            }
            const resultData = [];
            request(options,(error,response,html)=>{
                if (!error && response.statusCode === 200) {
                    const $ = cheerio.load(html);
                    
                    const body = $('#body').children('.container').children('.row').children().find(".col-sm-12").children(".news-container").each((idx,el)=>{
                        const blogTitle = $(el).find(".newsa").children("h2").text();
                        const blogUrl_endpoint = $(el).find(".newsa").attr("href");
                        const blogUrl = `${baseUrl}${blogUrl_endpoint}`;

                        // sending without time, make another method to bring time property
                        resultData.push({blogTitle,blogUrl});
                    })
                    
                    resolve(resultData);
                }else{
                    reject(response)
                }
    
            });
        } catch (error) {
            console.log(error.message);
            reject(error);
        }
    })
}


const scrapper_hardreset_timeGetter = (webUrl) =>{
    return new Promise((resolve,reject)=>{
        try {
            const options = {
                method: 'GET',
                url: webUrl,
                headers: fakeHadersList[Math.floor(Math.random()*fakeHadersList.length)]
            }
            
            request(options,(error,response,html)=>{
                if (!error && response.statusCode === 200) {
                    const $ = cheerio.load(html);

                    const time_noFormat = $("#body").find(".art-date").text();
                    const time = formatDate(time_noFormat);
                    
                    resolve(time);
                }else{
                    reject(response);
                }
    
            });
        } catch (error) {
            console.log(error.message);
            reject(error);
        }
    })
}




module.exports = {
    scrapper_getdroidtips,
    scrapper_hardreset,
    scrapper_hardreset_timeGetter,
    
}
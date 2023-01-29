const express = require("express");
const cort = require("cors");
const cheerio = require('cheerio');
require("dotenv").config();
const axios = require('axios');
const request = require('request');
var cron = require('node-cron');
var fs = require('fs');
var path = require('path');



const port = process.env.PORT || 5000;
const app = express();

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

app.get("/",(req,res)=>{
    res.send("Welcome at Scrapper")
})

app.get("/scrapping",async(req,res)=>{
    try {
        const urlList = ["https://www.getdroidtips.com"];
        const urlWithPageNumber = "https://www.getdroidtips.com/page/2/";
        // const scrap_result = await scrapMachine(urlList);
        // console.log(Buffer.byteLength(JSON.stringify(scrap_result), 'utf8')/1000 ,"kb object size");

        startScheduleScraping();
        
        // const isEmailSent = await sendEmail(scrap_result);
        // res.json({isEmailSent,scrap_result})

        // write to file for todays email list
        
        // res.json({total:scrap_result.length,scrap_result})
        res.send("end")
    } catch (error) {
        console.log(error);
    }
})

app.listen(port,()=>{
    console.log("Running app ", port);
})


// scheude the task(every 12 minutes) to keep awake the free server
const homeUrl=process.env.BASE_APP_URL;
const selfCaller = async()=>{
    try {
        const response = await axios.get(homeUrl);
        console.log(response.data," -:- ",new Date().toISOString());
    } catch (error) {
        console.log(error);
    }
}

let minutes = {value:0}; // max = 60*4 = 4hours
let counter = {value:0};
const tiemer = () =>{
    const intervalTimer = setInterval(()=>{
        // keep awake the render app
        if (counter.value > 12) {
            console.log("Minutes : ",counter.value,"  at ",new Date().getMinutes(), " when total :",minutes.value);
            selfCaller();
            counter.value = 0;
        }else{
            counter.value++;
        }

        // call the scrapper to scrap every 4 hours
        if (minutes.value > 60*4) {
            startScheduleScraping();
            minutes.value = 0;  // call the scrapper and make the munite 0
        }else{
            minutes.value += 1;  // add 1 minute
        }
        // clearInterval(intervalTimer);
    },1000*60)
}

tiemer();


// scheude the task(every 4 hours)
cron.schedule('0 */4 * * *', () => {
// cron.schedule('* * * * *', () => {
    // startScheduleScraping();
    // console.log('running a task every minute', new Date().toISOString());
});


const startScheduleScraping = async()=>{
    try {
        const urlList = ["https://www.getdroidtips.com"];
        const urlWithPageNumber = "https://www.getdroidtips.com/page/2/";

        // start the scrapper machine
        const scrap_result = await scrapMachine(urlList);
        console.log(Buffer.byteLength(JSON.stringify(scrap_result), 'utf8')/1000 ,"kb object size");


        // read to file for todays email list and remove the sent emails
        const filePath = path.resolve(__dirname,"./files/storage.json")
        const oldData = JSON.parse(fs.readFileSync(filePath));
        const newFilteredPosts = scrap_result.filter(newEl=>oldData?.find(oldEl => oldEl.blogTitle === newEl.blogTitle)? false:true);
        console.log("Old = ",oldData.length,", New Filter = ",newFilteredPosts.length,", Current without filter = ",scrap_result.length);

        if (newFilteredPosts.length > 0) {
            const isEmailSent = await sendEmail(newFilteredPosts);
            console.log("isEmailSent : ",isEmailSent);
        }

        const totalDatawithDuplicate = [...oldData,...scrap_result].filter(titleData => titleData.time?.trim() === new Date().toLocaleDateString("en",{year: 'numeric', month: 'long', day: 'numeric' }));
        const totalDataUnique = [...new Map(totalDatawithDuplicate.map(obj=>[obj.blogTitle,obj])).values()];
        // write to file for todays email list
        fs.writeFileSync(filePath,JSON.stringify(totalDataUnique.length?totalDataUnique:[],null,4));

        // res.json({total:scrap_result.length,scrap_result})
    } catch (error) {
        console.log(error);
    }
}


const stockUrls = {
    getdroidtips:"https://www.getdroidtips.com",
}

const scrapMachine = async(urls) =>{
    const titleList = [];
    for(let url of urls){
        switch (url) {
            case stockUrls.getdroidtips:
                // operate pagination
                let isMore = true;
                let pageNumber = 1;
                let paginationUrl = url;
                const tempTitleList = [];
                while(isMore){
                    const scrap_result = await webScrapper(paginationUrl);
                    const notTodaysPost = scrap_result.filter(titleData => titleData.time?.trim() !== new Date().toLocaleDateString("en",{year: 'numeric', month: 'long', day: 'numeric' }) );
                    if (notTodaysPost.length > 0) {
                        isMore = false;
                    }else{
                        scrap_result.forEach(titleData=>{
                            if ( titleData.time?.trim() === new Date().toLocaleDateString("en",{year: 'numeric', month: 'long', day: 'numeric' })) {
                                tempTitleList.push(titleData);
                            }
                        })
                        paginationUrl = `https://www.getdroidtips.com/page/${pageNumber}/`;
                        pageNumber = pageNumber + 1;
                    }
                }
                
                return tempTitleList;

            case 'next web site':
                break;
        
            default:
                break;
        };

    };
}



const webScrapper = (webUrl) =>{
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

async function sendEmail(titleInfo){
    if(!titleInfo.length) return;
    try {
        // format array to email message
        let linkListMessage = "";
        titleInfo.forEach((el,idx) =>{
            linkListMessage += `<li style="list-style: none;">(${idx+1}) <a href=${el.blogUrl}>${el.blogTitle}</a></li>`;
        })
        
        // send email
        const emailData = {
            service_id: process.env.EMAIL_SERVICE_ID,
            template_id: process.env.EMAIL_TEMPLATE_ID,
            user_id: process.env.EMAIL_PUBLIC_KEY_USER_ID,
            accessToken: process.env.EMAIL_PRIVATE_KEY_TOKEN,
            template_params: {
                'website_name': 'www.koko.vb',
                'to_name': 'Biddrup',
                'from_name': 'Shuvo',
                'message': `<div>
                    <h3>Hey lazy, Start writing the blogs.<h3>
                    ${linkListMessage}
                </div>`,
            },
            // headers: fakeHadersList[0],
        }
        
        const postUrl = 'https://api.emailjs.com/api/v1.0/email/send';
        const {error, data} = await axios.post(postUrl,emailData);
       return data === 'OK' ? true : false;
        
    } catch (error) {
        console.log(error);
        return error;
    }
}
const express = require("express");
const cort = require("cors");

require("dotenv").config();
const axios = require('axios');
var fs = require('fs');
var path = require('path');
const { scrapMachine, stockUrls } = require("./utils/scrapMachine");
const { filterBlogsSendEmailUpdateFile } = require("./utils/filter_store");
const { titleCounter } = require("./utils/commonTils");



const port = process.env.PORT || 5000;
const app = express();

app.get("/",(req,res)=>{
    res.send("Welcome at Scrapper")
})
app.get("/logs",async(req,res)=>{
    const logs = JSON.parse(fs.readFileSync(path.resolve(__dirname,"./files/logs.json")));
    res.json(logs)
})

app.get("/store",(req,res)=>{
    try {
        const pathOFStore = path.resolve(__dirname,"./files/storage.json");
        const old_data = JSON.parse(fs.readFileSync(pathOFStore));
        res.json({total:old_data.length,old_data});
    } catch (error) {
        console.log(error);
        res.json({error:true,message:error.message})
    }
})

app.get("/scrapping",async(req,res)=>{
    try {
        
        startScheduleScraping();
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
        // console.log(response.data," -:- ",new Date().toISOString());
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
            // console.log("Minutes : ",counter.value,"  at ",new Date().getMinutes(), " when total :",minutes.value);
            selfCaller();
            counter.value = 0;
        }else{
            counter.value++;
        }

        // call the scrapper to scrap every 3 hours
        const lag_time = process.env.LAG_TIME_MINUTES ? parseInt(process.env.LAG_TIME_MINUTES):10;
        if (minutes.value >= (lag_time || 60*4) ) { // six * hours number
            startScheduleScraping();
            minutes.value = 0;  // call the scrapper and make the munite 0
        }else{
            minutes.value += 1;  // add 1 minute
        }
        // clearInterval(intervalTimer);
    },1000*60)  
}
tiemer();

const today = new Date().toLocaleDateString("en",{year: 'numeric', month: 'long', day: 'numeric' });



const startScheduleScraping = async()=>{
    const urlList = [...Object.values(stockUrls)];
    try {
        
        // start the scrapper machine
        const scrap_result = await scrapMachine(urlList);
        // console.log(scrap_result,"NINE EIGHT");

        const {isEmailSent,sentList,newScrap,docList} = await filterBlogsSendEmailUpdateFile(scrap_result);
        const save2Doc = titleCounter(docList);
        const sent2Email = titleCounter(sentList);
        const new2Scrap = titleCounter(newScrap);
        // console.log("New Scrap:");
        // console.table(new2Scrap);
        // console.log("Sent to Email: ");
        // console.table(sent2Email);
        // console.log("Save to Doc:");
        // console.table(save2Doc);

        // write to loger file with time 
        const logInfo = {isEmailSent,new2Scrap,save2Doc,sent2Email,time: new Date().toISOString().split(".")[0].replace("T"," ")}

        const loggerFilePath = path.resolve(__dirname,"./files/logs.json");
        let existLogs = JSON.parse(fs.readFileSync(loggerFilePath)??[]);
        if (existLogs.length > 200) {
            existLogs = existLogs.slice(0,50);
        }
        const totalLogs = [logInfo,...existLogs];
        fs.writeFileSync(loggerFilePath,JSON.stringify(totalLogs,null,4));
        
        // end
    } catch (error) {
        console.log(error);
    }
}



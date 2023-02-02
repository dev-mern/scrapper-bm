
var path = require('path');
var fs = require('fs');
const { makeUniqueArray, formatDate } = require('./commonTils');
const { sendEmail } = require('./emailSender');

const filterBlogsSendEmailUpdateFile = async(scrapedDoc) =>{
    // console.log(scrapedDoc);
    
    const filePath = path.resolve(__dirname,"../files/storage.json");
    const oldData = JSON.parse(fs.readFileSync(filePath));
    const newPublishedList = {};
    Object.keys(scrapedDoc).forEach(site =>{
        const newBlogList = scrapedDoc[site];
        const newFilteredPosts = newBlogList.filter(newEl=>oldData[site]?.find(oldEl => oldEl.blogUrl === newEl.blogUrl)? false:true);
        const newFilterUnique = makeUniqueArray(newFilteredPosts);
        newPublishedList[site] = newFilterUnique;

        // remove yesterday's data from old data list to keep only the latest data in json file
        const totalwithDuplicate = [...oldData[site]??[],...newFilterUnique].filter(titleData => formatDate(titleData.time?.trim()) === formatDate());
        const totalUnique = makeUniqueArray(totalwithDuplicate);
        oldData[site] = totalUnique;
    })

    // send mail
    const isEmailSent = await sendEmail(newPublishedList);
    
    // write the new updated data to json file
    fs.writeFileSync(filePath,JSON.stringify(oldData??{},null,4));

    return {sentList:newPublishedList,isEmailSent,newScrap:scrapedDoc,docList:oldData};
}
module.exports = {
    filterBlogsSendEmailUpdateFile,
}
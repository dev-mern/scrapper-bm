const { filterNotTodaysPost, formatDate } = require("./commonTils");
const { scrapper_getdroidtips, scrapper_hardreset, scrapper_hardreset_timeGetter } = require("./scrappers");

const stockUrls = {
    getdroidtips:"https://www.getdroidtips.com",  
    hardreset:'https://www.hardreset.info',
}

const scrapMachine = async(urls) =>{
    const titleList = {};
    try {
        for(let url of urls){
            switch (url) {
                case stockUrls.getdroidtips:
                    // operate pagination
                    let isMore = true;
                    let pageNumber = 1;
                    let paginationUrl = url;
                    const tempTitleList = [];
                    while(isMore){
                        const scrap_result = await scrapper_getdroidtips(paginationUrl);
                        const notTodaysPost = scrap_result.filter(titleData => titleData.time?.trim() !== formatDate() );
                        if (notTodaysPost.length > 0) {
                            isMore = false;
                        }
    
                        if(scrap_result instanceof Array){
                            scrap_result.forEach(titleData=>{
                                if ( titleData.time?.trim() === formatDate()) {
                                    tempTitleList.push(titleData);
                                }
                            })
                            paginationUrl = `https://www.getdroidtips.com/page/${pageNumber}/`;
                            pageNumber = pageNumber + 1;
                        }
                    }
                    // return tempTitleList;
                    titleList[stockUrls.getdroidtips] = tempTitleList;
                    break;
    
                case stockUrls.hardreset:
                    // operate pagination
                    let isMore_hard = true;
                    let pageNumber_hard = 2;
                    let paginationUrl_hard = `${url}/articles`;
                    const tempTitleList_hard = [];
                    while (isMore_hard) {
                        const scrap_result_without_time = await scrapper_hardreset(paginationUrl_hard,`${url}`);
                        // console.log(scrap_result_without_time.length," scrap_result_without_time");
                        const scrap_result = [];
                        for(const blogObj of scrap_result_without_time){
                            const time = await scrapper_hardreset_timeGetter(blogObj.blogUrl);
                            scrap_result.push({...blogObj,time});
                        }
                        // check not today data
                        const notTodays = filterNotTodaysPost(scrap_result);
                        if (notTodays.length > 0) {
                            isMore_hard = false;
                        }
                        // console.log(scrap_result,"hard Scrap");
                        // keep only today's post
                        if(scrap_result instanceof Array){
                            scrap_result.forEach(titleData=>{
                                if ( titleData.time?.trim() === formatDate()) {
                                    tempTitleList_hard.push(titleData);
                                }
                            })
                            paginationUrl_hard = `https://www.hardreset.info/articles/?page=${pageNumber_hard}/`;
                            pageNumber_hard = pageNumber_hard + 1;
                        }
    
                    }
    
                    titleList[stockUrls.hardreset] = tempTitleList_hard;
                    break;
            
                default:
                    break;
            };
    
        };

        // console.log(titleList,"Final return");
        return titleList;
        
    } catch (error) {
        console.log(error.message," [>=== scrap Machine file Error]");
        return {};
    }
}


module.exports = {
    scrapMachine,
    stockUrls,
}
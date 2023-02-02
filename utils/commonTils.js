const makeUniqueArray = (arr) => [...new Map(arr.map(el=>[el.blogUrl,el])).values()];

const formatDate = (dateTime=new Date()) => new Date(dateTime).toLocaleDateString("en",{year: 'numeric', month: 'long', day: 'numeric' });

const titleCounter = (publishList) =>{
    const blogCount = {};
    Object.keys(publishList).forEach(site =>{
        publishList[site].forEach(titile=>{
            blogCount.hasOwnProperty(site) ? blogCount[site]++ : blogCount[site] = 1;
        })
    })
    return blogCount;
}

const filterNotTodaysPost = (titleList) => titleList.filter(titleData => titleData.time?.trim() !== formatDate());

module.exports = {
    makeUniqueArray,
    formatDate,
    titleCounter,
    filterNotTodaysPost
}
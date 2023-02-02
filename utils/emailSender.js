const axios = require('axios');

async function sendEmail(titleInfo){

    // don't send empty email
    let needToSendEmail = false;
    Object.keys(titleInfo).forEach(site =>{
        if(titleInfo[site].length > 0) needToSendEmail = true;
    })
    if(!needToSendEmail) return false;

    
    try {
        // format array to email message
        let totalTitleCount = 0;
        let linkListMessage = "";
        Object.keys(titleInfo).forEach(site =>{
            linkListMessage += `<u style="margin-bottom: 0;"><b><i> ${site} </i></b></u>`
            titleInfo[site].forEach((el,idx) =>{
                linkListMessage += `<li style="list-style: none; font-size: 14px; font-weight: normal;">(${idx+1}) <a href=${el.blogUrl}>${el.blogTitle}</a></li>`;
                totalTitleCount++;
            })

        })

        
        // send email
        const emailData = {
            service_id: process.env.EMAIL_SERVICE_ID,
            template_id: process.env.EMAIL_TEMPLATE_ID,
            user_id: process.env.EMAIL_PUBLIC_KEY_USER_ID,
            accessToken: process.env.EMAIL_PRIVATE_KEY_TOKEN,
            template_params: {
                'subject_title': `${totalTitleCount} New Blogs has been published at ${new Date().toISOString().split(".")[0].replace("T"," ")}`,
                'to_name': 'Biddrup',
                'from_name': 'Shuvo',
                'message': `<div>
                    <p>Hey lazy, Start writing the blogs.<p>
                    ${linkListMessage}
                </div>`,
            },
            // headers: fakeHadersList[0],
        }
        
        const postUrl = 'https://api.emailjs.com/api/v1.0/email/send';
        // const {error, data} = await axios.post(postUrl,emailData);
    //    return data === 'OK' ? true : false;
        
    } catch (error) {
        console.log(error);
        return error;
    }
}

module.exports = {
    sendEmail,

}
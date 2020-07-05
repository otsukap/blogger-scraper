const puppeteer = require('puppeteer');
const fs = require('fs');

// First launch chromium by using 
// <path to chromium> --remote-debugging-port=21222
// from the command line. Make sure you are logged into your google account.
// Example: 
// C:\Users\name\node_modules\puppeteer\.local-chromium\win64-756035\chrome-win\chrome.exe --remote-debugging-port=21222
// Then launch the script.
// (To find the path to chromium, uncomment console.log(puppeteer.executablePath()) and run the script. The path will
// be printed followed by an error.)

// Replace with url of first post on blog
const first_post_url = 'https://my-blog.blogspot.com/first-post.html';

(async () => {
    // console.log(puppeteer.executablePath())
    const browserURL = 'http://127.0.0.1:21222';
    const browser = await puppeteer.connect({browserURL});
    const page = await browser.newPage();
    
    await page.setViewport({width: 1300, height: 1400});
    await page.goto(first_post_url);
    const blog_name = await page.$eval('.titlewrapper > .title', res => {
        return res.innerText;
    }).catch((e) => {
        return '';
    });
    fs.mkdirSync(blog_name);
    var stream = fs.createWriteStream(blog_name + '/posts.md', {
        flags: 'a'
    });

    while (true) {
        sleep_time = Math.random()*10000;
        console.log("sleep " + sleep_time + " ms");
        await sleep(sleep_time);
        const datetime = await page.$eval('.timestamp-link > .published', res => {
            const date = new Date(res.title);
            const date_string = date.toDateString();
            const time_string = date.toLocaleTimeString({}, {hour12:true, hour:'numeric', minute:'numeric'});
            date_time_string = date_string + ' | ' + time_string
            return date_time_string;
        }).catch((e) => {
            return '';
        });
        
        const title = await page.$eval('.post-title', res => {
            return res.innerText;
        }).catch((e) => {
            return '';
        });
        
        const body = await page.$eval('.post-body', res => {
            return res.innerText;
        }).catch((e) => {
            return '';
        });
        
        stream.write(formatter(datetime, title, body));

        if (await page.$('.blog-pager-newer-link') != null) {
            await page.click('.blog-pager-newer-link');
        } else {
            break; // Reached end of blog/latest post
        }

    } 
    console.log("No more new posts.")
    stream.close()
    await browser.close();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }
 
function formatter(datetime, title, body) {
    datetime = '##### ' + datetime + '\n';
    title = '### ' + title + '\n'
    post_break = '\n\n---\n\n'
    return datetime + title + body + post_break;
}

})();

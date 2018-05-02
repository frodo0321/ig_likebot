const selenium = require('selenium-webdriver');
const {Builder, By, Capabilities, Key, until} = selenium;

const fs = require("fs");

const config = require("../config");


// return number between mid - range / 2, mid + range / 2
// mid=5, range=2, 4<x<6
function randomRange(mid, range) {
    var random = Math.random();
    var centered = random - 0.5
    var scaled = centered * range;
    var translated = scaled + mid;

    return translated;
}

var pageStates = ["login", "home", "tags", "tagsPicture"];

(async function() {

    const driver = new Builder()
        .withCapabilities(Capabilities.chrome())
        .build()
    var windowHandle = await driver.getWindowHandle();
    console.log("window handle", windowHandle);
    try {

        //async function init() {
        //    await driver.get("https://www.instagram.com");
        //    // TODO check if authenticated
        //}


        async function login() {
            await driver.get("https://www.instagram.com/accounts/login/")
            await driver.wait(until.elementLocated(new By("name", "username")));
            await driver.findElement(By.name("username")).sendKeys(config.username);
            await driver.sleep(randomRange(1, 0.5) * 1000);
            console.log(driver.actions().sendKeys);
            console.log(driver.actions().keyboard);
            await driver.sleep(randomRange(1, 0.5) * 1000);
            await driver.findElement(By.name("password")).sendKeys(config.password);
            await driver.sleep(randomRange(1, 0.5) * 1000);
            //await driver.findElement(By.name("password")).sendKeys(Key.RETURN);
            await driver.findElement(By.xpath("//button[contains(text(),'Log in')]")).click();

            
            await driver.wait(until.elementLocated(By.xpath("//a[contains(text(),'Instagram')]")));
            console.log("Page loaded");
            //var cookies = driver.getCookies();
            //console.log("cookies", cookies);
        
        }

        await login();


        async function goToExploreTagPage(tag) {
            console.log("Go to explore tag", tag);

            await driver.get("https://www.instagram.com/explore/tags/" + tag + "/")
            await driver.wait(until.elementLocated(By.xpath("//div[contains(text(),'Top posts')]")));
        
        }
        async function scrollToMostRecent() {
            console.log("scrolling to most recent");
            
            var loop = true;
            var i = 0;
            while (loop && i < 50) {
                console.log("scroll", i);
                await driver.sleep(randomRange(2, 1) * 1000);
                await driver.executeScript("window.scrollBy(0, 100)");
                var ret = await until.elementIsVisible(By.xpath("//h2[contains(text(),'Most recent')]"))
                console.log("ret", ret);
                i+=1;
            }
            
        }
        async function getFirstPictureElement() {
            console.log("getFirstPictureElement()");
            var e = await driver.findElement(By.xpath("//div/div/a/div/div/img/../.."))
            //console.log("first picture element", e);

            //var r = e.getRect();
            //var center = {x: r.x + (r.width / 2), y: r.y + (r.height / 2)};
            //console.log("");
            //await driver.actions().mouseMove(center).click().perform();
            //e.click()
            //console.log("parent", p);
            return e;
        }
        async function openTopPicture() {
            console.log("openTopPicture()");
            var pictureElement = await getFirstPictureElement()
            await pictureElement.click();
            return await driver.sleep(randomRange(2, 1) * 1000);
        }

        async function tryLikeOpenPicture() {
            console.log("likeOpenPicture()");
                
            var likeButton;
            try {
                likeButton = await driver.findElement(By.xpath("//span[contains(text(),'Like')]"))
            } catch (error) {console.log("error", error);}
            console.log("like button", likeButton);
            // usually means already liked
            if (!likeButton) {
                return await driver.sleep(randomRange(2, 1));
            }
            await likeButton.click();
            return await driver.sleep(randomRange(2, 1)); //TODO detect when next picture is loaded
        }
        async function goNextPicture() {
            console.log("goNextPicture()");

            var nextButton = await driver.findElement(By.xpath("//a[contains(text(),'Next')]"));

            // gotta do it this way since there is apparently an overlay
            console.log("executing click on next button", nextButton);
            await driver.executeScript("arguments[0].click();", nextButton);

            //await nextButton.click();
            return await driver.sleep(randomRange(2, 0.5) * 1000); //TODO detect when next picture is loaded
        
        }

        await goToExploreTagPage("salad");
        await openTopPicture();

        var i = 0;
        var numPics = 200;
        while (i<numPics) {
            console.log("liking picture", i);
            await tryLikeOpenPicture();
            await driver.sleep(randomRange(1, 0.5) * 1000); //TODO detect when next picture is loaded
            await goNextPicture();
            await driver.sleep(randomRange(1, 0.5) * 1000); //TODO detect when next picture is loaded
            i+=1;
        }




        //await scrollToMostRecent();
        
        // works on home screen only
        async function locateAndLike() {
            //driver.wait(until.elementVisible
            await driver.sleep(randomRange(2, 0.5) * 1000);
            await driver.executeScript("window.scrollBy(0, 250)");
            await driver.sleep(randomRange(2, 0.5) * 1000);
            await driver.executeScript("window.scrollBy(0, 250)");
            await driver.sleep(randomRange(2, 0.5) * 1000);
            await driver.executeScript("window.scrollBy(0, 250)");
            await driver.sleep(randomRange(2, 0.5) * 1000);

            await driver.findElement(By.xpath("//span[contains(text(),'Like')]"))
                .then(element => {
                    console.log("found like button", element);
                    return element.click();
                })

            await driver.findElement(By.xpath("//span[contains(text(),'Like')]"))
                .then(element => {
                    console.log("found like button", element);
                    return element.click();
                })
        
        }
        //await locateAndLike();


        //await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    
    }
    catch (error) {
        console.log("error happened", error);
    }
    finally {
        await driver.sleep(100000);
    }

}())

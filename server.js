import puppeteer from "puppeteer";
import fs from "fs";

const url =
  "https://www.amazon.com/s?i=computers-intl-ship&bbn=16225007011&rh=n%3A16225007011%2Cn%3A1292115011%2Cp_n_feature_fifteen_browse-bin%3A17751807011&dc&ds=v1%3AHWABRhMtMMT36h0l3x5YsmFAy67LB%2FTSsblhmpaGkf4&qid=1707571672&rnid=17751799011&ref=sr_nr_p_n_feature_fifteen_browse-bin_4";

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();
  await page.goto(url);

  let isBtnDisabled = false;
  let data = [];

  while (!isBtnDisabled) {
    const productsHandles = await page.$$(
      "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item" // to be more specific.
    );

    for (const product of productsHandles) {
      let title = "null";
      let price = "null";
      let img = "null";

      try {
        title = await page.evaluate(
          (el) => el.querySelector("h2 > a > span").textContent,
          product
        );
        // console.log(title);
      } catch (error) {}

      try {
        price = await page.evaluate(
          (el) => el.querySelector(".a-price > .a-offscreen").textContent,
          product
        );
        // console.log(price);
      } catch (error) {}

      try {
        img = await page.evaluate(
          (el) => el.querySelector(".a-section > .s-image").getAttribute("src"), // or .src
          product
        );
        // console.log(img);
      } catch (error) {}

      // console.log(title, price, img);

      if (title !== "null") {
        // fs.appendFile(
        //   "results.csv",
        //   `${title.replace(/,/g, ".")}, ${price} , ${img} \n`,
        //   (err) => {
        //     if (err) throw err;
        //   }
        // );
        data.push({ title, price, img });
        // fs.writeFileSync("data.json", JSON.stringify(data));
      }
    }

    await page.waitForSelector(".s-pagination-next", { visible: true }); // works without this

    const is_disabled =
      (await page.$(".s-pagination-next.s-pagination-disabled")) !== null; // when we reach the last page

    isBtnDisabled = is_disabled;

    if (!is_disabled) {
      // when its false do this at the same time: [ when we are not on the last page ]
      await Promise.all([
        page.click(".s-pagination-next"),
        page.waitForNavigation({ waitUntil: "networkidle2" }),
      ]);
    }
  }
  // console.log(data);
  // await page.screenshot({ path: "example.png" }); //takes screenshot of the page
  await browser.close(); // closes the browser when everything is finished
};

main();

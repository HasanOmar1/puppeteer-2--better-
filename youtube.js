import puppeteer from "puppeteer";

const url = "https://www.youtube.com/";

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    userDataDir: "yt-temp",
  });
  const page = await browser.newPage();
  await page.goto(url);

  let items = [];

  // Wait for the container that holds all the video thumbnails to load
  await page.waitForSelector(".style-scope.ytd-rich-grid-row");

  const ytData = await page.$$(".style-scope.ytd-rich-grid-row");

  for (const data of ytData) {
    let title = "null";
    let img = "null";

    try {
      // Extract the title
      title = await page.evaluate(
        (el) => el.querySelector("#video-title").textContent,
        data
      );
    } catch (error) {}

    try {
      // Extract the image URL
      img = await page.evaluate(
        (el) =>
          el.querySelector("#thumbnail > yt-image > img").getAttribute("src"),
        data
      );
    } catch (error) {}

    // If both title and img are not "null", push them to items
    if (title !== "null" && img !== null) {
      items.push({ title, img });
    }
  }

  console.log(items);
  console.log(items.length);

  // Close the browser
  await browser.close();
};

main();

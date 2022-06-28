const request = require("request");
const cheerio = require("cheerio");

function requestUrl(url) {
  return new Promise((resolve, reject) => {
    request(url, (err, res, html) => {
      if (err) return resolve(null);
      return resolve(html);
    });
  });
}

function getComicData(html) {
  const $ = cheerio.load(html);
  const title = $($("span.series-name > a")).text();
  let tag = "";
  $("div.series-gernes").each((index, e) => {
    tag = $(e).text();
  });
  tag = tag.split("\n").filter((t) => t.length > 0);

  let author = "";
  let artist = "";
  let status = "";
  $("span.info-value").each((index, e) => {
    if (index === 0) author = $(e).text();
    if (index === 1) artist = $(e).text();
    if (index === 2) status = $(e).text();
  });
  let sumary = $($("div.summary-content > p")).text();
  let thumbnail = $($("div.series-cover > div.a6-ratio > div"))
    .attr("style")
    .split("'")[1];

  let volume = getVolumeData($);

  return { title, tag, author, artist, status, sumary, thumbnail, volume };
}

function getVolumeData($) {
  const volume = [];
  $("section.volume-list").each((index, e) => {
    const header = $(e).find("header");
    const title = $(header[0])
      .text()
      .split("\n")
      .filter((v) => v.length > 0)[0];
    const main = $(e).find("main")[0];

    const leftSection = $(main).children("div").children("div")[0];
    const rightSection = $(main).children("div").children("div")[1];
    const thumbnail = $(leftSection)
      .children("div")
      .children("a")
      .children("div")
      .children("div")
      .attr("style")
      .split("'")[1];
    const link = $(leftSection).children("div").children("a").attr("href");

    const chapter = [];
    const ulList = $(rightSection).children("ul").children("li");
    ulList.each((_index, _e) => {
      let result = $(_e).children("div")[0];
      let title = $(result).children("a").text();
      let link = $(result).children("a").attr("href");
      chapter.push({ title, link });
    });

    volume.push({ title, thumbnail, link, chapter });
  });
  return volume;
}

const getCommic = async (url) => {
  const html = await requestUrl(url);
  return getComicData(html);
};

module.exports = { requestUrl, getCommic };

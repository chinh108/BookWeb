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

const getComicData = async (html) => {
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

  let volume = await getVolumeData($);

  return { title, tag, author, artist, status, sumary, thumbnail, volume };
};

const getVolumeData = async ($) => {
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
    ulList.each(async (_index, _e) => {
      let result = $(_e).children("div")[0];
      let title = $(result).children("a").text();
      let link = $(result).children("a").attr("href");
      chapter.push({ title, link });
    });

    volume.push({ title, thumbnail, link, chapter });
  });

  for (let index in volume) {
    for (let _index in volume[index].chapter) {
      const data = await getChapterData(
        `https://docln.net${volume[index].chapter[_index].link}`
      );
      volume[index].chapter[_index] = {
        ...volume[index].chapter[_index],
        data,
      };
    }
  }

  return volume;
};

const getChapterData = async (link) => {
  const html = await requestUrl(link);
  const $ = await cheerio.load(html);
  let data = [];
  const content = $("div#chapter-content").find("p");
  content.each((index, e) => {
    let img = $(e).find("img").attr("src");
    let text = $(e).text();
    img && data.push(img);
    text && data.push(text);
  });

  if (data.length === 0) {
    console.log(link);
    console.log(content.length);
  }

  return data;
};

const getCommic = async (url) => {
  const html = await requestUrl(url);
  return getComicData(html);
};

module.exports = { requestUrl, getCommic ,getChapterData};

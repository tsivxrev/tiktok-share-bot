const TikTokScraper = require('tiktok-scraper');
const axios = require('axios');
const { logger } = require("../module/logger");
require('dotenv').config()


class TikTok {

    constructor(videoUrl) {

        this.videoUrl = videoUrl;
        this.options = {
            noWaterMark: true,
            hdVideo: true
        };
    }
    async getVideoMetaInfo() {
        logger.info("Getting video meta from: " + this.videoUrl, {label: 'TikTok Module'})
        this.video = await TikTokScraper.getVideoMeta(this.videoUrl, this.options);
        
        return this.video;
    }
    getFullUrl() {
        return `https://tiktok.com/@${this.video.collector[0].authorMeta.name}/video/${this.video.collector[0].id}/`
    }

    getAuthorUrl() {
        return `https://tiktok.com/@${this.video.collector[0].authorMeta.name}/`
    }

    getMusicString() {
        return `${this.video.collector[0].musicMeta.musicAuthor} - ${this.video.collector[0].musicMeta.musicName} `
    }

    getFullDescriptionMarkDown() {
        return "Text: " + this.video.collector[0].text + "\n\nMusic: " + this.getMusicString() + "\n\nVideo: " + this.getFullUrl() + "\nAuthor: " + this.getAuthorUrl()
    }

    async getBuffer(watermark=false) {
        try {
            let url = watermark ? this.video.collector[0].videoUrl : this.video.collector[0].videoUrlNoWaterMark

            const response = await axios.get(url,
                {
                    responseType: 'arraybuffer',
                    headers: this.video.headers
                }
            );
            return Buffer.from(response.data);
        }
        catch (error) {
            throw new TIKTOK_MODULE_ERROR('Video download error: ' + error);
        }
    }
}

class TIKTOK_MODULE_ERROR extends Error {
    constructor(message) {
      super(message);
      this.name = 'TIKTOK_MODULE_ERROR';
      this.message = message;
    }
}


module.exports = {
    TikTok
}

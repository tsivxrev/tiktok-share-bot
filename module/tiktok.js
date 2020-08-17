const TikTokScraper = require('tiktok-scraper');
const axios = require('axios');
const { VK } = require('vk-io');
require('dotenv').config()
const { logger } = require("../module/logger");


class TikTok {

    longUrl = /^https:\/\/www.tiktok.com\/@.+\/video\/\d+/i;
    shortUrl = /^https:\/\/vm.tiktok.com\/.+\/?/i;

    constructor(videoUrl, options={}) {

        this.videoUrl = videoUrl;
        this.options = options;
        this.watermark = options.noWaterMark ? options.noWaterMark : false;
    }
    async getVideoMetaInfo() {
        logger.info("Getting video meta from: " + this.videoUrl, {label: 'TikTok Module'})
        this.video = await TikTokScraper.getVideoMeta(this.videoUrl, this.options);
        
        return this.video;
    }
    getVideoId() {
        return this.video.collector[0].id
    }

    getRawUrls() {
        return { 
            "videoUrl": this.video.collector[0].videoUrl,
            "videoUrlNoWaterMark": this.video.collector[0].videoUrlNoWaterMark
        };
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

    getNameVideo() {
        return this.video.collector[0].text;
    }
    
    getFullDescription() {
        return `Text: ${this.video.collector[0].text}\n\nMusic: ${this.getMusicString()}\n\nVideo: ${this.getFullUrl()}\nAuthor: ${this.getAuthorUrl()}`
    }

    getFullDescriptionMarkDown() {
        return "Text: " + this.video.collector[0].text + "\n\nMusic: " + this.getMusicString() + "\n\nVideo: " + this.getFullUrl() + "\nAuthor: " + this.getAuthorUrl()
    }

    async getBuffer() {
        try {
            
            const response = await axios.get(this.video.collector[0].videoUrl, 
                {
                    responseType: 'arraybuffer',
                    headers: this.video.headers
                }
            );
            //console.info(JSON.stringify(this.video.headers, '', '\t'))
            return Buffer.from(response.data);
        }
        catch (error) {
            throw new TIKTOK_MODULE_ERROR('Video download error: ' + error);
        }
    }
    async getImageBuffer() {
        try {
            const response = await axios.get(this.video.collector[0].imageUrl, {responseType: 'arraybuffer'});
            return Buffer.from(response.data);
        }
        catch {
            throw new TIKTOK_MODULE_ERROR('Image download error');
        }
    }
}

class Uploader {
    constructor(video) {
        this.groupId = process.env.GROUP_ID;
        this.access_token = process.env.USER_TOKEN;

        if(!this.groupId || !this.access_token) {
            throw new UPLOADER_MODULE_ERROR('Invalid parameters');
        }

        this.vk = new VK({
            token: this.access_token
        });

        this.video = video
    }

    async getVkAttachment(watermark=true) {

        logger.info("Uploading attachment...", {label: 'TikTok Module'})

        const video = await this.vk.upload.video({
            source: watermark ? this.video.getRawUrls().videoUrl : this.video.getRawUrls().videoUrlNoWaterMark,
            group_id: this.groupId,
            name: this.video.getNameVideo() + " | TikTok Share",
            description: this.video.getFullDescription(),
            album_id: 2,
            repeat: 1
        }).catch(error => {
            logger.error(error, {label: 'Telegram'})
             throw new UPLOADER_MODULE_ERROR(error);
        })

        logger.info("Succesfull uploaded attachment for VK. Attachment: " + video.toString(), {label: 'TikTok Module'})
        return this.addingAttachment(watermark, video);
    }

    addingAttachment(watermark, video) {
        return video
    }
}

class TIKTOK_MODULE_ERROR extends Error {
    constructor(message) {
      super(message);
      this.name = 'TIKTOK_MODULE_ERROR';
      this.message = message;
    }
}

class UPLOADER_MODULE_ERROR extends Error {
    constructor(message) {
      super(message);
      this.name = 'UPLOADER_MODULE_ERROR';
      this.message = message;
    }
}


module.exports = {
    TikTok, Uploader
}

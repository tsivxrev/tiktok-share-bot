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
        return this.video.id
    }

    getRawUrls() {
        return { "videoUrl": this.video.videoUrl,"videoUrlNoWaterMark": this.video.videoUrlNoWaterMark || this.video.videoUrl};
    }

    getFullUrl() {
        return `https://tiktok.com/@${this.video.authorMeta.name}/video/${this.video.id}/`
    }

    getAuthorUrl() {
        return `https://tiktok.com/@${this.video.authorMeta.name}/`
    }

    getMusicString() {
        return `${this.video.musicMeta.musicAuthor} - ${this.video.musicMeta.musicName} `
    }

    getNameVideo() {
        return this.video.text;
    }
    getFullDescription() {
        return `Text: ${this.video.text}\n\nMusic: ${this.getMusicString()}\n\nVideo: ${this.getFullUrl()}\nAuthor: ${this.getAuthorUrl()}`
    }
    async getBuffer() {
        try {
            const response = await axios.get(this.watermark ? this.video.videoUrl : this.video.videoUrlNoWaterMark, {responseType: 'arraybuffer'});
            return Buffer.from(response.data);
        }
        catch {
            throw new TIKTOK_MODULE_ERROR('Video download error');
        }
    }
    async getImageBuffer() {
        try {
            const response = await axios.get(this.video.imageUrl, {responseType: 'arraybuffer'});
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
        // logInformation.info("Get attachment from DataBase...")
        // let videoId = this.video.getVideoId();

        // let _video = await findClip(videoId).catch(err => errorLog.error(err))

        // if (watermark) {
        //     if (_video.VKattachmentWatermark) {
        //         return _video.VKattachmentWatermark
        //     }
        // }
        // else {
        //     if (_video.VKattachmentNoWatermark) {
        //         return _video.VKattachmentNoWatermark
        //     }
        // }

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
        // if (watermark) {
        //     addVKAttachWithWatermark(this.video.getVideoId(), video.toString()).then(() => {
        //         logDbInformation.info("Update attachment with watermark. Attachment: " + video.toString() + " Clip ID: " + this.video.getVideoId())
        //     }).catch((err) => { errorLog.error(err)})
        // } else {
        //     addVKAttachWithoutWatermark(this.video.getVideoId(), video.toString()).then(() => {
        //         logDbInformation.info("Update attachment without watermark. Attachment: " + video.toString() + " Clip ID: " + this.video.getVideoId())
        //     }).catch((err) => {errorLog.error(err)})
        // }
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

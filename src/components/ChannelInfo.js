import React, { Component } from 'react';
import Rect from '../models/Rect';
import EPGUtils from '../utils/EPGUtils';
import '../styles/app.css';
import CanvasUtils from '../utils/CanvasUtils';

export default class ChannelInfo extends Component {

    constructor(props) {
        super(props);

        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.parentHandleKeyPress = props.parentHandleKeyPress;
        this.unmountHandler = props.unmountHandler;
        this.showTvHandler = props.showTvHandler;
        this.showSettingsHandler = props.showSettingsHandler;
        this.epgData = props.epgData;
        this.imageCache = props.imageCache;
        this.channelPosition = props.channelPosition;
        this.epgUtils = new EPGUtils();
        this.canvasUtils = new CanvasUtils();

        this.mChannelInfoHeight = 150;
        this.mChannelInfoTitleSize = 36;
        this.mChannelLayoutTextColor = '#d6d6d6';
        //this.mChannelLayoutTitleTextColor = '#c6c6c6';
        this.mChannelLayoutMargin = 3;
        this.mChannelLayoutPadding = 7;
        this.mChannelLayoutBackground = '#323232';
        this.mChannelLayoutBackgroundFocus = 'rgba(65,182,230,1)';

        this.reapeater = {};
        this.timeoutReference = {};
    }

    handleKeyPress(event) {
        let keyCode = event.keyCode;

        switch (keyCode) {
            case 461: // back button
            case 13: // ok button -> switch to focused channel
                // do not pass this event to parent
                event.stopPropagation();
                this.unmountHandler();
                break;
        }
        
    };

    drawChannelInfo(canvas) {
        // Background
        let drawingRect = new Rect();
        drawingRect.left = 0;
        drawingRect.top = 0;
        drawingRect.right = this.getWidth();
        drawingRect.bottom = this.getHeight();
        canvas.globalAlpha = 1.0;
        // put stroke color to transparent
        canvas.strokeStyle = "gradient";
        //mPaint.setColor(mChannelLayoutBackground);
        // canvas.fillStyle = this.mChannelLayoutBackground;
        // Create gradient
        var grd = canvas.createLinearGradient(drawingRect.top, drawingRect.top, drawingRect.top, drawingRect.bottom);
        // Important bit here is to use rgba()
        grd.addColorStop(0, "rgba(35, 64, 84, 0.0)");
        grd.addColorStop(0.5, "rgba(35, 64, 84, 0.5)");
        grd.addColorStop(0.9, "rgba(35, 64, 84, 1.0)");
        //grd.addColorStop(1, 'rgba(35, 64, 84, 1.0)');

        // Fill with gradient
        canvas.fillStyle = grd;
        canvas.fillRect(drawingRect.left, drawingRect.top, drawingRect.width, drawingRect.height);

        //console.log("Channel: First: " + firstPos + " Last: " + lastPos);
        drawingRect.left += this.mChannelLayoutMargin;
        drawingRect.top += this.mChannelLayoutMargin;
        drawingRect.right -= this.mChannelLayoutMargin;
        drawingRect.bottom -= this.mChannelLayoutMargin;


        let channel = this.epgData.getChannel(this.channelPosition);
        
        // channel number
        //canvas.strokeStyle = ;
        // drawingRect.top = 70;
        // drawingRect.left += 100;
        // canvas.font = "bold " + this.mChannelInfoTextSize + "px Arial";
        // canvas.fillStyle = this.mChannelLayoutTextColor;
        // canvas.textAlign = 'right';
        // canvas.fillText(channel.getChannelID(), drawingRect.left, drawingRect.top);

        // channel name
        // drawingRect.left += 15;
        // drawingRect.top += this.mChannelInfoTitleSize + this.mChannelLayoutPadding;
        // drawingRect.right = this.getWidth();
        // canvas.font = "bold " + this.mChannelInfoTitleSize + "px Arial";
        // canvas.textAlign = 'left';
        // canvas.fillText(this.canvasUtils.getShortenedText(canvas, channel.getName(), drawingRect),
        //     drawingRect.left, drawingRect.top);

        // channel logo
        drawingRect.top = 0;
        drawingRect.right = drawingRect.left + drawingRect.height + 50;
        //drawingRect.bottom = this.getHeight();
        canvas.textAlign = 'left';
        let imageURL = channel.getImageURL();
        let image = this.imageCache.get(imageURL);
        if (image !== undefined) {
            drawingRect = this.getDrawingRectForChannelImage(drawingRect, image);
            canvas.drawImage(image, drawingRect.left, drawingRect.top, drawingRect.width, drawingRect.height);
        }
        
        // channel event
        drawingRect.left += drawingRect.right + 20;
        drawingRect.right = this.getWidth();
        drawingRect.top = this.getHeight() / 2 - this.mChannelInfoTitleSize + (this.mChannelInfoTitleSize / 2) + this.mChannelLayoutPadding;
        canvas.font = this.mChannelInfoTitleSize + "px Arial";
        canvas.fillStyle = this.mChannelLayoutTextColor;
        canvas.textAlign = 'left';
        let currentEvent, nextEvent;
        for (let event of channel.getEvents()) {
            if (event.isCurrent()) {
                currentEvent = event;
                continue;
            }
            if(currentEvent !== undefined) {
                nextEvent = event;
                break;
            }
        };
        if(currentEvent !== undefined) {
            // draw current event
            canvas.fillText(this.canvasUtils.getShortenedText(canvas, currentEvent.getTitle(), drawingRect),
                        drawingRect.left, drawingRect.top);
            if(currentEvent.getSubTitle() !== undefined) {
                // draw subtitle event
                canvas.font = this.mChannelInfoTitleSize - 10 + "px Arial";
                drawingRect.top += this.mChannelInfoTitleSize + this.mChannelLayoutPadding;  
                canvas.fillText(this.canvasUtils.getShortenedText(canvas, currentEvent.getSubTitle(), drawingRect),
                    drawingRect.left, drawingRect.top);
            }
        }

        // TODO from-until - current position

    }

    getDrawingRectForChannelImage(drawingRect, image) {
        drawingRect.left += this.mChannelLayoutPadding;
        drawingRect.top += this.mChannelLayoutPadding;
        drawingRect.right -= this.mChannelLayoutPadding;
        drawingRect.bottom -= this.mChannelLayoutPadding;

        let imageWidth = image.width;
        let imageHeight = image.height;
        let imageRatio = imageHeight / parseFloat(imageWidth);

        let rectWidth = drawingRect.right - drawingRect.left;
        let rectHeight = drawingRect.bottom - drawingRect.top;

        // Keep aspect ratio.
        if (imageWidth > imageHeight) {
            let padding = parseInt((rectHeight - (rectWidth * imageRatio)) / 2);
            drawingRect.top += padding;
            drawingRect.bottom -= padding;
        } else if (imageWidth <= imageHeight) {
            let padding = parseInt((rectWidth - (rectHeight / imageRatio)) / 2);
            drawingRect.left += padding;
            drawingRect.right -= padding;
        }

        return drawingRect;
    }

    getWidth() {
        return window.innerWidth;
    }

    getHeight() {
        return this.mChannelInfoHeight;
    }

    componentDidMount() {
        this.updateCanvas();
        this.focus();

        // set timeout to automatically unmount
        this.timeoutReference = setTimeout(() => this.unmountHandler(), 5*1000);
        
    }

    componentDidUpdate(prevProps) {
        this.updateCanvas();
        //this.setFocus();
        //setInterval(this.unmountHandler(), 5000);
    }

    componentWillUnmount() {
        clearTimeout(this.timeoutReference);
    }

    focus() {
        this.refs.info.focus();
    }

    updateCanvas() {
        this.ctx = this.refs.canvas.getContext('2d');
        // clear
        this.ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
        // draw children “components”
        this.onDraw(this.ctx)
    }

    onDraw(canvas) {
        if (this.epgData !== null && this.epgData.hasData()) {
            this.drawChannelInfo(canvas);
        }
    }

    getCanvas() {
        return this.refs.canvas;
    }

    render() {
        return (
            <div id="channelinfo-wrapper" ref="info" tabIndex='-1' onKeyDown={this.handleKeyPress} className="channelInfo">
                <canvas ref="canvas"
                    width={this.getWidth()}
                    height={this.getHeight()}
                    style={{ border: 'none' }}/>
            </div>
        );
    }
}
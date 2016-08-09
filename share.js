/**
 * Created by liux on 2016/1/22.
 */


function play(e) {
    var log=console.log.bind(console);
    var media = new Audio("Let It Go.mp3");//实例化一个对象
    var starttime = 0, endtime = 0, time = 0, excerpt = false;//cid音包标识id
    var bdot = e.find(".bdot");
    var bar = e.find(".bar");
    var nowtime = e.find(".nowtime");
    var alltime = e.find(".alltime");
    var progress = e.find(".play-progress");
    var journey = progress.width();
    var dot = e.find(".dot");
    var loading = e.find(".loading");
    var icon=$("#icon");
    var lyricContainer = $('#lrcContainer');
    var startx, s, choke = false,lightlrc;
    /*播放进度条控制开始*/
    function tstart() {
        event.stopPropagation();
        event.preventDefault();

        startx = event.targetTouches[0].pageX;
        bdot.show();
         s= bar.width();
    }

    function tmove() {
        event.stopPropagation();
        event.preventDefault();
        if (event.targetTouches.length == 1) {
            choke = true;
            var journeyx = event.targetTouches[0].pageX;
            var x = journeyx - startx;
            setbar(x);
        }

    }

    function setbar(x) {
        var ndot;
        if ((s + x) < 0) {
            ndot = 0;
        } else if ((s + x) > journey) {
            ndot = journey;
        } else {
            ndot = s + x;
        }
        bar.width(ndot);
    }

    function tend() {
        event.stopPropagation();
        event.preventDefault();
        bdot.hide();
        var s, rate;
        if (!choke) {
            var left = dot.offset().left;
            if (startx < left) {
                rate = -3
            } else if (startx > left) {
                rate = 3
            }
            var speed = (rate * journey) / time;
            setbar(speed);
        } else {
            s = bar.width();
            rate = s / journey;
            choke = false;
        }
        //todo输出播放进度
        setrate(rate);
    }

    //根据拖动的位置设置播放时间
    function setrate(rate) {
        var seeking = rate;
        if (0 <= rate && rate <= 1) {
            seeking = parseInt(rate * time) + starttime;
            media.currentTime = seeking;
        } else if (seeking == -3) {
            media.currentTime += -3;
        } else if (seeking == 3) {
            media.currentTime += 3;
        }
    }
    /*
     * 设置播放显示
     * 作者：liux
     * 输入参数：
     * 返回参数:无
     */
    function format(time) {
        var m = parseInt(time / 60);
        (m > 99) ? m = 99 : m;
        var s = parseInt(time % 60);
        (s<10)?s='0'+s:s;
        return m + ":" + s;
    }
    function getrate(ctime,rate) {
        nowtime.text(format(parseInt(ctime,10)));
        alltime.text(format(parseInt(time)));
        if (!choke) {
            bar.width(parseInt(rate *journey,10));
        }
    }
    progress[0].addEventListener("touchstart", tstart);
    progress[0].addEventListener("touchmove", tmove);
    progress[0].addEventListener("touchend", tend);
    /*播放进度条控制结束*/

    /*缓冲、播放进度、播放、暂停、播放设置，开始*/
    media.addEventListener("timeupdate", rate);
    function rate(){
        //log(media.buffered,media.controller,media.crossOrigin,media.played,media.preload,media.seekable,media.textTracks);
        if (media.currentTime<starttime){
            media.volume=1;
            media.currentTime=starttime;
            return;
        }
        if(endtime==0){
            time=endtime=parseInt(media.duration,10);
        }
        var ctime= media.currentTime-starttime;
        if(ctime<0){ctime=0}
        else if(ctime>time){
            ctime=time
        }
        var rate=ctime/time;
        if(media.duration!=0){
            getrate(ctime,rate);
            if(typeof lightlrc=="function"){
                lightlrc(media.currentTime);
            }
        }
        if(excerpt&&media.currentTime>=endtime){
            playend();
        }
    }

    function playend(){
        media.pause();
    }
    /*缓冲、播放进度、播放、暂停、播放设置，结束*/
    //当前播放已结束
    media.addEventListener("ended", playend);

    //输出缓冲进度
    function buffer(){
        var start,end,Abuffer=[];
        for(var i=0;i<media.buffered.length;i++){
            start=(media.buffered.start(i)-starttime).toFixed(2);
            if(start<0){
                start=0
            }else if(start>time){
                start=time;
            }
            end=(media.buffered.end(i)-starttime).toFixed(2);
            if(end<0){
                end=0
            }else if(end>time){
                end=time;
            }
            if(start!=end){
                Abuffer.push({start:start/time,end:end/time});
            }
        }
        if(Abuffer.length!=0){
            var A = Abuffer[0]["end"];//数组中存储所有缓冲区段，暂时取第一个缓冲区
            loading.width(A*journey);
        }
    }
    media.addEventListener("progress", buffer);
    media.addEventListener("canplay", function () {
        if (media.currentTime < starttime) {
            media.volume = 0;
        }
        new spectrum(media).init();
        media.play();
    });
    //监听暂停事件
    media.addEventListener("pause", function () {
        getplay("pause")
    });
    //监听播放事件
    media.addEventListener("play", function () {
        getplay("play")
    });
    function getplay(state) {
        if (state == "play") {
           icon.removeClass("play").addClass("pause");
        } else {
            icon.removeClass("pause").addClass("play");
        }
    }
    //设置播放状态
    (function(){
      icon.on("click",function(){
          if(media.paused){
              media.play()
          }else{
              media.pause()
          }
          return false;
      })
    }());

//歌词
//格式化格式
    function parseLyric(text) {
        //将文本分隔成一行一行，存入数组
        var lines = text.split('\n'),
        //用于匹配时间的正则表达式，匹配的结果类似[xx:xx.xx]
            pattern = /\[\d{2}:\d{2}.\d{2}\]/g,
        //保存最终结果的数组
            result = [];
        //去掉不含时间的行
        while (!pattern.test(lines[0])) {
            lines = lines.slice(1);
        }
        //上面用'\n'生成生成数组时，结果中最后一个为空元素，这里将去掉
        lines[lines.length - 1].length === 0 && lines.pop();
        lines.forEach(function(v /*数组元素值*/ , i /*元素索引*/ , a /*数组本身*/ ) {
            //提取出时间[xx:xx.xx]
            var time = v.match(pattern),
            //提取歌词
                value = v.replace(pattern, '');
            //因为一行里面可能有多个时间，所以time有可能是[xx:xx.xx][xx:xx.xx][xx:xx.xx]的形式，需要进一步分隔
            time.forEach(function(v1, i1, a1) {
                //去掉时间里的中括号得到xx:xx.xx
                var t = v1.slice(1, -1).split(':');
                //将结果压入最终数组
                result.push([parseInt(t[0], 10) * 60 + parseFloat(t[1]), value]);
            });
        });
        //最后将结果数组中的元素按时间大小排序，以便保存之后正常显示歌词
        result.sort(function(a, b) {
            return a[0] - b[0];
        });
        return result;
    }
// 显示歌词的元素
    function showlrc(lyric){
        var str="";
        for(var i=0;i<lyric.length;i++){
            str+='<li>'+ lyric[i][1]+'</li>'
        }
        var t=(lyricContainer.parent().height())/2;
        lyricContainer.css("top",t);
        lyricContainer.html(str);
    }
//设置歌词
    function setlrc(lyric){
        //请求歌词并显示
        var  ali,t;
        ali=lyricContainer.find("li");
        t=(lyricContainer.parent().height())/2;
        lightlrc=function  (time) {
            for (var i = 0; i < lyric.length; i++) {
                var tag=(i+1)==lyric.length?true:time<=lyric[(i+1)][0];
                if (time>= lyric[i][0]&&tag) {
                    //显示到页面
                    ali.removeClass("light");
                    ali.eq(i).addClass("light");
                    var h=ali.eq(i).position().top;
                    var height=ali.eq(i).height()/2;
                    lyricContainer.animate({top:t-h-height},300);
                }
            }
        }
    }

    function lrc(e){
        var lyric=parseLyric(e);
        showlrc(lyric);
        setlrc(lyric);
    }

    function init(){
        var title=e.find("h1");
        var author=e.find("h2");
        var pic=$("#img-box>img");
        var bg=$(".bg");
      /*  //excerpt=data.excerpt;
        //if(excerpt){
        //    starttime=data.start;
        //    endtime=data.end;
        //}
        //title.text(data.title);
        //author.text();
        //pic.attr("src",data.audio);
        //bg.css("background","url("+data.img+") no-repeat");*/
        //media.src="Let It Go.mp3";
        $.post("Let It Go.lrc", function (e) {
            lrc(e);
        });

    }init();
}

var spectrum= function (audio) {
    this.audio=audio;
    this.file = null; //the current file
    this.fileName = null; //the current file name
    this.audioContext = null;
    this.source = null; //the audio source
    this.infoUpdateId = null; //to sotore the setTimeout ID and clear the interval
    this.animationId = null;
    this.status = 0; //flag for sound is playing 1 or stopped 0
    this.forceStop = false;

};
spectrum.prototype={
    init:function () {
        this._prepareAPI();
    },
    _prepareAPI: function() {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
            this.audioContext = new AudioContext();
            this._analyser();

            //this._analyser('!Your browser does not support AudioContext', false);
            console.log(1);

    },
    _analyser: function () {
        var audioContext=this.audioContext;
        var source=audioContext.createMediaElementSource(this.audio);
        var analyser=audioContext.createAnalyser();
//连接：source → analyser → destination
        source.connect(analyser);
        analyser.connect(audioContext.destination);
       this._drawSpectrum(analyser)
    },
    _drawSpectrum: function(analyser) {
        var canvas = document.getElementById('canvas');
        var cwidth = canvas.width;
        var cheight = canvas.height - 2;
        var ctx=canvas.getContext("2d");
        var lenght=analyser.frequencyBinCount;
        var array = new Uint8Array(lenght);

        var anima=function () {
            analyser.getByteFrequencyData(array);
            ctx.clearRect(0, 0, cwidth, cheight);
            ctx.beginPath();
            ctx.moveTo(0, cheight);
            for (var i = 0; i < cwidth; i++){
                ctx.lineTo(i, cheight - cheight *array[Math.round(i*lenght/cwidth)] / 255);
            }

            ctx.fillStyle = "red";
            ctx.lineTo(i, cheight);
            ctx.fill();
            //请求下一帧
            requestAnimationFrame(anima);
        };
        anima();
        }

        //var that = this,
        //    canvas = document.getElementById('canvas'),
        //    cwidth = canvas.width,
        //    cheight = canvas.height - 2,
        //    meterWidth = 10, //width of the meters in the spectrum
        //    gap = 2, //gap between meters
        //    capHeight = 2,
        //    capStyle = '#fff',
        //    meterNum = 800 / (10 + 2), //count of the meters
        //    capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        //ctx = canvas.getContext('2d'),
        //    gradient = ctx.createLinearGradient(0, 0, 0, 300);
        //gradient.addColorStop(1, '#0f0');
        //gradient.addColorStop(0.5, '#ff0');
        //gradient.addColorStop(0, '#f00');
        //var drawMeter = function() {
        //    var array = new Uint8Array(analyser.frequencyBinCount);
        //    console.log(array);
        //    analyser.getByteFrequencyData(array);
        //    if (that.status === 0) {
        //        //fix when some sounds end the value still not back to zero
        //        for (var i = array.length - 1; i >= 0; i--) {
        //            array[i] = 0;
        //        };
        //        allCapsReachBottom = true;
        //        for (var i = capYPositionArray.length - 1; i >= 0; i--) {
        //            allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
        //        };
        //        if (allCapsReachBottom) {
        //            cancelAnimationFrame(that.animationId); //since the sound is stoped and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
        //            return;
        //        };
        //    };
        //    var step = Math.round(array.length / meterNum); //sample limited data from the total array
        //    ctx.clearRect(0, 0, cwidth, cheight);
        //    for (var i = 0; i < meterNum; i++) {
        //        var value = array[i * step];
        //        if (capYPositionArray.length < Math.round(meterNum)) {
        //            capYPositionArray.push(value);
        //        };
        //        ctx.fillStyle = capStyle;
        //        //draw the cap, with transition effect
        //        if (value < capYPositionArray[i]) {
        //            ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
        //        } else {
        //            ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
        //            capYPositionArray[i] = value;
        //        };
        //        ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
        //        ctx.fillRect(i * 12 /*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight); //the meter
        //    }
        //    that.animationId = requestAnimationFrame(drawMeter);
        //}
        //this.animationId = requestAnimationFrame(drawMeter);


};

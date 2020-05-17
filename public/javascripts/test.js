function videoLayout() {
    try {
        var margin=5
        var top=15;
        var beetwen=10;

        if( window.innerWidth<977)
        {
            var margin=0
            var top=5;
            var beetwen=0;
        }

        var trBox = document.getElementById("meetVideoBox");
        trBox.style.position = "relative";
        var fullW = trBox.clientWidth - 20;

        var pgm = arrVideo.filter(e => e.pgm == true)
        if (pgm.length > 0 && isPgm) {
            var pip = arrVideo.filter(e => e.pip == true)
            arrVideo.forEach(a => {
                var elem = document.getElementById("meetVideoItem_" + a.id);
                elem.style.zIndex = 10;
                elem.style.display = "none";
            })

            var elem = document.getElementById("meetVideoItem_" + pgm[0].id);
            elem.style.position = "fixed";
            elem.style.top = pip.length > 0 ? ("12.5vh") : ("0");
            elem.style.left = 0;
            elem.style.width = pip.length > 0 ? ("75%") : ("100%");
            elem.style.zIndex = 100;
            elem.style.display = "block";

            if (pip.length > 0) {
                var elem = document.getElementById("meetVideoItem_" + pip[0].id);
                elem.style.position = "fixed";
                elem.style.top = "50vh";
                elem.style.left = "75%";
                elem.style.width = ("25%");
                elem.style.zIndex = 200;
                elem.style.display = "block";
            }
            return;
        }

        arrVideo.forEach(a => {
            var elem = document.getElementById("meetVideoItem_" + a.id);
            elem.style.zIndex = 10;
            elem.style.display = "block";
        })
        if (arrVideo.length == 1) {
            setVideoLayout(arrVideo[0].id, 0, fullW * .05, fullW * .9)
            trBox.style.height = ((fullW / 1.777) + 20) + "px"
        }
        if (arrVideo.length == 2) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .5 +margin, fullW * .5 -margin)
            trBox.style.height = ((fullW / 1.777) + 40) + "px"
        }
        if (arrVideo.length == 3) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .5 +margin, fullW * .5 -margin)
            setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 + 10) / 1.777 +margin, fullW * .25 +margin, fullW * .5 -margin)
            trBox.style.height = ((fullW * .5 +margin / 1.777) + 20) * 2 + "px"
        }
        if (arrVideo.length == 4) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .5 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .5 +margin, fullW * .5 -margin)
            setVideoLayout(arrVideo[2].id, 15 + (fullW * .5 +margin) / 1.777 +margin, 0, fullW * .5 -margin)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .5 +margin) / 1.777 +margin, fullW * .5 +margin, fullW * .5 -margin)
            trBox.style.height = (((fullW * .5 +margin) / 1.777) + 20) * 2 + "px"
        }
        if (arrVideo.length ==margin) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
            trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
        }
        if (arrVideo.length == 6) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
            trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
        }
        if (arrVideo.length == 7) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, 0, fullW * .3 -margin)
            trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
        }
        if (arrVideo.length == 8) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .3 +margin) * 1, fullW * .3 -margin)
            trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
        }
        if (arrVideo.length == 9) {
            setVideoLayout(arrVideo[0].id, 15, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[1].id, 15, fullW * .3 +margin, fullW * .3 -margin)
            setVideoLayout(arrVideo[2].id, 15, (fullW * .3 +margin) * 2, fullW * .3 - 10)
            setVideoLayout(arrVideo[3].id, 15 + (fullW * .3 + 10) / 1.777 +margin, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[4].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 1, fullW * .3 -margin)
            setVideoLayout(arrVideo[5].id, 15 + (fullW * .3 + 10) / 1.777 +margin, (fullW * .3 +margin) * 2, fullW * .3 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, 0, fullW * .3 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .3 +margin) * 1, fullW * .3 -margin)
            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .3 +margin) * 2, fullW * .3 -margin)
            trBox.style.height = (((fullW * .3 + 10) / 1.777) + 20) * 3 + "px"
        }
        if (arrVideo.length == 10) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)

            trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
        }
        if (arrVideo.length == 11) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)

            trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
        }
        if (arrVideo.length == 12) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
        }
        if (arrVideo.length == 13) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)

            trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
        }
        if (arrVideo.length == 14) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 1, fullW * .25 -margin)

            trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
        }
        if (arrVideo.length == 15) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
        }
        if (arrVideo.length == 16) {

            setVideoLayout(arrVideo[0].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[1].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[2].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[3].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 0, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[4].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[5].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[6].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[7].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 1, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[8].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[9].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[10].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[11].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 2, (fullW * .25 +margin) * 3, fullW * .25 -margin)

            setVideoLayout(arrVideo[12].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 0, fullW * .25 -margin)
            setVideoLayout(arrVideo[13].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 1, fullW * .25 -margin)
            setVideoLayout(arrVideo[14].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 2, fullW * .25 -margin)
            setVideoLayout(arrVideo[15].id, 15 + ((fullW * .3 + 10) / 1.777 +margin) * 3, (fullW * .25 +margin) * 3, fullW * .25 -margin)
            trBox.style.height = (((fullW * .25 + 10) / 1.777) + 20) * 4 + "px"
        }

        arrVideo.forEach(e => {

        })
    }
    catch (e) {
        console.warn(e)
    }

}
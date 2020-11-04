var app;

window.onload=function () {

     app = new Vue({
         el: '#app',
         data: {

             sect: [],
             activeSection: 2,
             chat: [],
             isChat: room.isChat,
             users: [],
             q: [],
             isQ: room.isQ,
             isLenta: room.isLenta,
             qText: "",
             chatText: "",
             stageChatText: "",
             stageChat: [],
             user: null,
             isUsers: room.isUsers,
             handUp: false,
             socket: null,
             files: [],
             isFiles: room.isFiles,
             eventRooms: [],
             invitedUsers: [],
             invites: [],
             videoReceivers: [],
             room: room,
             isHead: true,
             votes: [],
             userFindText: "",
             langCh: [],
             showLangCh: false,
             constraints: null,
             firstConnect: true,
             isMyVideo: false,
             isMyVideoEnabled: false,
             isMyMute: false,
             isMyDtShow: false,
             isMod: isMod,
             init: false,
             messageFromMod: "",
             messageToModText: "",
             errorMessage: "",
             stageTimer: 0,
             stageTimeout: null,
             tags: [],
             pole: [],
             selLang: 'ru',
             lang: {ru: {}, en: ""},
             pres:null,
             previewPres:[],
             isPres:false,
             isPresFullScreen:false,
         },
         methods: {
             getPresBgUrl:function(pres){
                 return 'url(/rest/api/pres/'+pres+'/'+eventid+'/'+roomid+')'
             },
             setPres:function (id) {
                 this.pres=id;
                 if(this.pres) {
                     this.isPres=true
                     var elem = document.getElementById("pres" + id)
                     if (elem)
                         elem.scrollIntoView({inline: "center", behavior: "smooth"})

                 }
                 else{
                     this.isPres=false;
                 }
             },
             changeLang:function (selLang) {
                 localStorage.setItem("selLang", selLang)
                 this.selLang=selLang;},
         },
         watch: {
             /*  activeSection:function () {
                   window.scrollTo(0,document.body.scrollHeight);
               }*/
             //
         },
         computed: {},
         mounted: async function () {
             var _this = this;
             var r = await axios.get("/rest/api/lang");
             this.lang = r.data;
             this.selLang = localStorage.getItem("selLang") || "en";
             this.changeLang(this.selLang);


             var dt=await axios.get('/rest/api/info/' + eventid + "/" + roomid)

                     _this.user = dt.data;
                     connect(_this, roomid, function (socket) {
                         _this.socket = socket;
                         document.getElementById("app").style.opacity = 1;

                     axios.get("/rest/api/activePres/" + eventid + "/" + roomid)
                         .then(function (ff) {
                             _this.pres = ff.data.item
                         })

                     //  var scrElem = rHead;
                     //  scrElem.scrollLeft = (scrElem.scrollWidth - scrElem.clientWidth) / 2

                 })
         }
     }
     )}






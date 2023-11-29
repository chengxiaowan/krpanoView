window.app = new Vue({
    el: '#app',
    data: {
        id: '',
        scenceData: {},
        imgList: [],
        current: "",
        showList: false,
        listData: [
            { icon: 'iconjianjie', text: 'Introduction' },
            { icon: 'iconyinle', text: 'music' },
            { icon: 'iconshijiao', text: 'perspective' },
            { icon: 'iconqingping', text: 'cls' },
        ]

    },
    methods: {
        //获取URL参数
        getUrlParam(name) {
            let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            let r = window.location.search.substr(1).match(reg);
            if (r != null) return decodeURIComponent(r[2]);
            return "1";
        },

        async getDataById(id = 1) {
            const data = dataJson;
            console.log(dataJson)
            this.scenceData = data.find(item => item.id == id);
            console.log(this.scenceData)
            this.imgList = this.scenceData.imageList.map(x => {
                return {
                    src: `/image/vrtour/${x.src}`,
                    link: x.link,
                    name: x.name,
                    imgList: x.imgList,
                    id: x.id,
                }
            })
            this.current = this.imgList[0];

        },

        // 添加图片
        addImage(src, h, v, width, height, item) {
            console.log('执行');
            var hs_name = 'hs' + ((Date.now() + Math.random()) | 0);
            window.krpano_interface.call('addhotspot(' + hs_name + ')');
            window.krpano_interface.set('hotspot[' + hs_name + '].url', src);
            window.krpano_interface.set('hotspot[' + hs_name + '].ath', h);
            window.krpano_interface.set('hotspot[' + hs_name + '].atv', v);
            window.krpano_interface.set('hotspot[' + hs_name + '].width', width);
            window.krpano_interface.set('hotspot[' + hs_name + '].height', height);
            window.krpano_interface.set('hotspot[' + hs_name + '].zoom', 'true');
            window.krpano_interface.set('hotspot[' + hs_name + '].keep', 'false');
            window.krpano_interface.set('hotspot[' + hs_name + '].visible', 'true');
            window.krpano_interface.set('hotspot[' + hs_name + '].enabled', 'true');
            window.krpano_interface.set('hotspot[' + hs_name + '].distorted', 'true');
            window.krpano_interface.set('hotspot[' + hs_name + '].pixelhittest', 'true');
            window.krpano_interface.set('hotspot[' + hs_name + '].handcursor', 'true');
            if (item.link) {
                window.krpano_interface.set('hotspot[' + hs_name + '].text', item.name);
                window.krpano_interface.set('hotspot[' + hs_name + '].onloaded', 'do_crop_animation(128,128, 60);add_all_the_time_tooltip()');
                window.krpano_interface.set('hotspot[' + hs_name + '].onclick', () => {
                    let data = this.scenceData.imageList.filter((_) => _.link == item.link);
                    if (data.length > 0) {
                        this.imgColor(data[0]);
                    }
                });
            }
        },
        // 当前场景跳转
        imgColor(data) {
            if (data.id == this.current.id) {
                console.log('当前场景', data);
                return;
            }
            this.current = data;
            window.krpano_interface.call(`loadscene(${data.link})`);
            //每次跳转过后都重新渲染热点

            for (let i = 0; i < data.imgList.length; i++) {
                ((i, arr) => {
                    setTimeout(() => {
                        this.addImage(`/${arr[i].url}`, arr[i].h, arr[i].v, arr[i].width, arr[i].height, arr[i]);
                    }, 300 * i);
                })(i, data.imgList);
            }
        }
    },
    async mounted() {
        console.log('mounted');
        const _this = this;
        await this.getDataById(this.getUrlParam('id'));
        //初始化全景图
        embedpano({
            swf: `/vr_vtour/${this.scenceData.VrPath}/tour.swf`,
            xml: `/vr_vtour/${this.scenceData.VrPath}/tour.xml`,
            target: 'pano',
            html5: 'auto',
            mobilescale: 1.0,
            passQueryParameters: true,
            onready: (krpano_interface) => {
                window.krpano_interface = krpano_interface;
                setTimeout(() => {
                    this.showList = true;
                    for (let i = 0; i < this.current.imgList.length; i++) {
                        ((i, arr) => {
                            setTimeout(() => {
                                this.addImage(`/${arr[i].url}`, arr[i].h, arr[i].v, arr[i].width, arr[i].height, arr[i]);
                            }, 300 * i);
                        })(i, this.current.imgList);
                    }
                    _this.showList = true;
                }, 3000)
            }
        })
    },
})
$(document).ready(function () {
    var ObjectInformer2 = function (el) {
        var $this = this;
        this.element = el;
        this.opened = false;
        this.closeButton = $(this.element).find('.object-info-closer');

        this.closeButton.bind('click.objectinformer', function (e) {
            $this.closePanel();
        });

        this.open = function () {
            $(this.element).slideDown(140);
            this.opened = true;
        };

        this.closePanel = function () {
            $(this.element).slideUp(140);
            this.opened = false;
            activePoint.collapsePoint();
        };
    };

    var activePointClass = function () {
        var $this = this;

        this.setPoint = function (obj) {
            $this.point = obj;
        };

        this.expandPoint = function () {
            if (typeof this.point == "object") {
                this.point.options.set('preset', 'islands#blueStretchyIcon');
                this.point.properties.set({
                    iconContent: this.point.properties.get('hintContent'),
                    hintContent: ''

                });
            }
        };

        this.collapsePoint = function () {
            if (typeof this.point == "object") {
                this.point.options.set('preset', 'islands#blueIcon');
                this.point.properties.set({
                    hintContent: this.point.properties.get('iconContent'),
                    iconContent: ''
                });
            }
        };
    };


    ymaps.ready(init);
    var myMap;
    var informer = new ObjectInformer2($('.object-info'));
    var activePoint = new activePointClass();

    function init() {
        myMap = new ymaps.Map("map", {
            center: [44.951344, 34.091122],
            zoom: 2,
            behaviors: ['drag', 'scrollZoom']
        }, {
            restrictMapArea: [
                [44.99730657, 34.04156120],
                [44.88946320, 34.15459007]
            ]
        });

        myMap.controls.remove('typeSelector');
        myMap.controls.remove('searchControl');
        myMap.controls.remove('trafficControl');

        //Координаты и данные будут грузиться с сервера. А пока так.
        var myPlacemark = new ymaps.Placemark([44.952333, 34.097111], {
                hintContent: 'Симфер!'
                //        iconContent: 'Симфер'
                //        balloonContent: 'Столица Крыма'
            },
            {
                preset: "islands#blueIcon"
            });

        var circus = new ymaps.Placemark(
            [44.94977202, 34.09922868],
            {
                hintContent: 'Цирк-хуирк!'
            },
            {
                preset: "islands#blueIcon"
            });

        myMap.geoObjects.add(myPlacemark);
        myMap.geoObjects.add(circus);

        myMap.geoObjects.events.add('click', function (e) {
            //Получение координат щелчка
            //console.log(e.get('target').geometry.getBounds()[0]);
            var object = e.get('target');
            var eventCoords = e.get('coords');
            var targetCoords = object.geometry.getBounds();

            if (object.geometry.getType() == 'Point') {
                activePoint.collapsePoint();
                activePoint.setPoint(object);
                activePoint.expandPoint();
                targetCoords = targetCoords[0];


                myMap.panTo(getDeposedCoordinates(targetCoords));
                informer.open();
            }
        });

        myMap.geoObjects.events.add('mouseenter', function (e) {
            // Получение ссылки на дочерний объект, на котором произошло событие.
            var object = e.get('target');
            if (object.geometry.getType() == 'Point' && !informer.opened && object.properties.get('hintContent')) {
                activePoint.setPoint(object);
                activePoint.expandPoint();
            }
        });

        myMap.geoObjects.events.add('mouseleave', function (e) {
            var object = e.get('target');
            if (object.geometry.getType() == 'Point' && !informer.opened && object.properties.get('iconContent')) {
                activePoint.setPoint(object);
                activePoint.collapsePoint();
            }
        });
    }

    function getDeposedCoordinates(coords) {
        var projection = myMap.options.get('projection');

        var pixelsCoords = myMap.converter.globalToPage(
            projection.toGlobalPixels(coords, myMap.getZoom())
        );

        return projection.fromGlobalPixels(
            myMap.converter.pageToGlobal([pixelsCoords[0] + $(informer.element).width() / 2, pixelsCoords[1]]), myMap.getZoom()
        );
    }
});